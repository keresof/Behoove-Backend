import mongoose from "mongoose";
import submissionSchema from "./submissionSchema";
import { ISubmission } from "./submission";
import { getRandomBytes } from "../../../utilities/cryptoService";

export enum ContestStatus {
    UPCOMING = 'upcoming',
    SUBMISSION = 'submission',
    VOTING = 'voting',
    FINISHED = 'finished',
    ARCHIVED = 'archived'
}

export enum ContestType {
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

export interface IContest extends mongoose.Document {
    title: string;
    description: string;
    type: ContestType;
    status: ContestStatus;
    startDate: Date;
    submissionEndDate: Date;
    votingEndDate: Date;
    archiveDate: Date;
    contestNumber: number;
    year: number;
    submissions: any;
    submissionCount: () => Promise<number>;
    createSubmission: (userId: mongoose.Types.ObjectId, mediaId: mongoose.Types.ObjectId) => Promise<any>;
    getWinnerSubmission: () => Promise<ISubmission>;
    getFinalists: () => Promise<ISubmission[]>;
}

export interface IContestModel extends mongoose.Model<IContest> {
    updateContestStatuses: () => Promise<void>;
    getNextContestNumber: (type: ContestType, year: number) => Promise<number>;
    getRecentFinishedContests: (type: ContestType, limit?: number) => Promise<IContest[]>;
}


const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100,
        default: 'Weekly Contest'
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,
        default: 'Join the weekly contest!'
    },
    type: {
        type: String,
        enum: Object.values(ContestType),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(ContestStatus),
        required: true,
        default: ContestStatus.UPCOMING
    },
    startDate: {
        type: Date,
        required: true
    },
    submissionEndDate: {
        type: Date,
        required: true
    },
    votingEndDate: {
        type: Date,
        required: true
    },
    archiveDate: {
        type: Date,
        required: true
    },
    contestNumber: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    seed: {
        type: String,
        required: true,
        default: () => getRandomBytes(16)
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            delete ret.seed;
            return ret;
        }
    },
});

contestSchema.index({ startDate: 1 });
contestSchema.index({ submissionEndDate: 1 });
contestSchema.index({ votingEndDate: 1 });
contestSchema.index({ archiveDate: 1 });
contestSchema.index({ status: 1 });
contestSchema.index({ type: 1, year: 1, contestNumber: 1 }, { unique: true });



contestSchema.virtual('submissions').get(async function () {
    const Submission = mongoose.model('Submission', submissionSchema);
    return await Submission.find({ contest: this._id });
});

contestSchema.pre('save', async function (next) {
    if (!this.isNew && this.isModified('seed')) {
        throw new Error('Seed cannot be modified');
    }
    next();
});

contestSchema.methods.submissionCount = async function () {
    const Submission = mongoose.model('Submission', submissionSchema);
    return Submission.countDocuments({ contest: this._id });
}

contestSchema.methods.createSubmission = async function (userId: mongoose.Types.ObjectId, mediaId: mongoose.Types.ObjectId) {
    if (this.status !== ContestStatus.SUBMISSION) {
        throw new Error('Submissions are not currently allowed for this contest');
    }
    const Submission = mongoose.model('Submission', submissionSchema);
    const submission = new Submission({ contest: this._id, user: userId, media: mediaId });
    return submission.save();
};

contestSchema.methods.getWinnerSubmission = async function () {
    if (this.status !== ContestStatus.FINISHED) {
        throw new Error('The winner has not been selected yet');
    }
    const Submission = mongoose.model('Submission', submissionSchema);
    return Submission.findOne({ contest: this._id }).sort({ votes: -1 }).limit(1);
}

contestSchema.methods.getFinalists = async function () {
    if (this.status !== ContestStatus.VOTING) {
        throw new Error('The finalists have not been selected yet');
    }
    const Submission = mongoose.model('Submission', submissionSchema);
    const finalists = await Submission.aggregate([
        // Match submissions for this contest
        { $match: { contest: this._id } },

        // Lookup to get post data
        {
            $lookup: {
                from: 'posts',
                let: { mediaId: '$media' },
                pipeline: [
                    { $match: { $expr: { $in: ['$$mediaId', '$media'] } } },
                    { $project: { likeCount: 1 } }
                ],
                as: 'postData'
            }
        },
        { $unwind: '$postData' },

        // Sort by post likeCount descending
        { $sort: { 'postData.likeCount': -1 } },

        // Add a field to help with random selection
        {
            $addFields: {
                random: {
                    $function: {
                        body: function (id: any, seed: any) {
                            const crypto = require('crypto');
                            const hash = crypto.createHash('sha256');
                            hash.update(seed);
                            hash.update(id.toString());
                            return parseInt(hash.digest('hex'), 16) / Math.pow(2, 256);
                        },
                        args: ['$_id', this.seed],
                        lang: 'js'
                    }
                }
            }
        },

        // Separate top 70 and remaining submissions
        {
            $facet: {
                top70: [{ $limit: 70 }],
                remaining: [{ $skip: 70 }, { $sort: { random: 1 } }, { $limit: 30 }]
            }
        },

        // Combine top 70 and random 30
        {
            $project: {
                finalists: { $concatArrays: ['$top70', '$remaining'] }
            }
        },
        { $unwind: '$finalists' },
        { $replaceRoot: { newRoot: '$finalists' } },

        // Remove the temporary fields we added
        { $project: { postData: 0, random: 0 } }
    ]);
    return finalists;
}

contestSchema.statics.updateContestStatuses = async function () {
    const now = new Date();

    // Update contests to SUBMISSION phase
    await this.updateMany(
        { status: ContestStatus.UPCOMING, startDate: { $lte: now } },
        { $set: { status: ContestStatus.SUBMISSION } }
    );

    // Update contests to VOTING phase
    await this.updateMany(
        { status: ContestStatus.SUBMISSION, submissionEndDate: { $lte: now } },
        { $set: { status: ContestStatus.VOTING } }
    );

    // Update contests to FINISHED phase
    await this.updateMany(
        { status: ContestStatus.VOTING, votingEndDate: { $lte: now } },
        { $set: { status: ContestStatus.FINISHED } }
    );

    // Archive old contests
    await this.updateMany(
        { status: ContestStatus.FINISHED, archiveDate: { $lte: now } },
        { $set: { status: ContestStatus.ARCHIVED } }
    );
};



contestSchema.statics.getNextContestNumber = async function (type: ContestType, year: number) {
    const lastContest = await this.findOne({ type, year })
        .sort({ contestNumber: -1 })
        .limit(1);

    return lastContest ? lastContest.contestNumber + 1 : 1;
};

contestSchema.statics.getRecentFinishedContests = async function (type: ContestType, limit: number = 5) {
    return this.find({ type, status: ContestStatus.FINISHED })
        .sort({ contestNumber: -1, year: -1 })
        .limit(limit);
};

export default mongoose.model<IContest, IContestModel>('Contest', contestSchema);