import mongoose from "mongoose";
import { CONTEST_VOTE_LIMIT } from "../../../utilities/constants";

const voteSchema = new mongoose.Schema({
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
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
}, {
    timestamps: true
});

voteSchema.index({ contest: 1, submission: 1});

voteSchema.pre('save', async function (next) {
    const vote = this;
    const voteCount = await (vote.constructor as any).countDocuments({ contest: vote.contest, user: vote.user });
    if (voteCount > CONTEST_VOTE_LIMIT) {
        throw new Error('You have already voted for the maximum number of submissions allowed');
    }
    const submissionCount = await (vote.constructor as any).countDocuments({ contest: vote.contest, submission: vote.submission });
    if (submissionCount > 0) {
        throw new Error('You have already voted for this submission');
    }
    next();
});

export default voteSchema;