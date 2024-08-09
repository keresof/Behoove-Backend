import mongoose from "mongoose";
import voteSchema from "./voteSchema";

export default mongoose.model('Vote', voteSchema);