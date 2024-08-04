import mongoose from 'mongoose';
import { IBrand } from './brand';

export interface IItem extends mongoose.Document {
  name: string;
  type: 'clothing' | 'accessory' | 'jewelry' | 'shoes';
  brand: IBrand['_id'];
  size?: string;
  description?: string;
  color?: string;
  material?: string;
  price?: number;
  currency?: string;
  cloData?: any;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['clothing', 'accessory', 'jewelry', 'shoes'],
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  size: String,
  description: String,
  color: String,
  material: String,
  price: Number,
  currency: String,
  cloData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

itemSchema.index({ name: 1 });
itemSchema.index({ brand: 1 });
itemSchema.index({ type: 1 });

export default mongoose.model<IItem>('Item', itemSchema);