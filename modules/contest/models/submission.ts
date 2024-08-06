import mongoose from "mongoose";
import submissionSchema from "./submissionSchema";

export interface ISubmission extends mongoose.Document {
    contest: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    media: mongoose.Types.ObjectId;
    voteCount: () => Promise<number>;
    vote: (userId: mongoose.Types.ObjectId) => Promise<any>;
}

export default mongoose.model<ISubmission>('Submission', submissionSchema);