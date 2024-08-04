import mongoose from "mongoose";
import mediaSchema from "./mediaSchema";

export default mongoose.model('Media', mediaSchema);