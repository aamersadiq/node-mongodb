import mongoose, { Schema, Document } from 'mongoose';

/**
 * Account document interface for MongoDB
 */
export interface IAccountDocument extends Document {
  name: string;
  balance: number;
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Account schema for MongoDB
 */
const AccountSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    uuid: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAccountDocument>('Account', AccountSchema);