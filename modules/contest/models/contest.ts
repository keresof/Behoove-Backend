import mongoose from "mongoose";
import submissionSchema from "./submissionSchema";

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
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    submissionEndDate: {
        type: Date,
        required: true
    },
}, {
    timestamps: true
});

contestSchema.index({ startDate: 1 });
contestSchema.index({ submissionEndDate: 1 });

contestSchema.virtual('submissions').get(async function () {
    const Submission = mongoose.model('Submission', submissionSchema);
    return await Submission.find({ contest: this._id });
});

contestSchema.methods.submissionCount = async function () {
    const Submission = mongoose.model('Submission', submissionSchema);
    return Submission.countDocuments({ contest: this._id });
}

contestSchema.methods.createSubmission = async function (userId: mongoose.Types.ObjectId, mediaId: mongoose.Types.ObjectId) {
    const Submission = mongoose.model('Submission', submissionSchema);
    const submission = new Submission({ contest: this._id, user: userId, media: mediaId });
    return submission.save();
}