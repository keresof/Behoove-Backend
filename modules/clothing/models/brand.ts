import mongoose from 'mongoose';

export interface IBrand extends mongoose.Document {
  name: string;
  description?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  logo: String
}, {
  timestamps: true
});

brandSchema.index({ name: 1 });

export default mongoose.model<IBrand>('Brand', brandSchema);