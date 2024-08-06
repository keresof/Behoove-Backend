import mongoose from "mongoose";
import voteSchema from "./voteSchema";

const submissionSchema = new mongoose.Schema({
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    },
}, {
    timestamps: true
});

submissionSchema.index({ contest: 1, user: 1 }, { unique: true });

submissionSchema.methods.voteCount = async function () {
    const Vote = mongoose.model('Vote', voteSchema);
    return Vote.countDocuments({ contest: this.contest, submission: this._id });
}

submissionSchema.methods.vote = async function (userId: mongoose.Types.ObjectId) {
    const Vote = mongoose.model('Vote', voteSchema);
    const vote = new Vote({ contest: this.contest, submission: this._id, user: userId });
    return vote.save();
}

submissionSchema.pre('save', async function (next) {
    const existing = await (this.constructor as any).find({ contest: this.contest, user: this.user });
    if (existing.length > 0) {
        throw new Error('You have already submitted to this contest');
    }
    next();
});

export default submissionSchema;