import mongoose, { Schema, Document } from 'mongoose';
import { TransactionType, TransactionStatus } from '../../domain/entities/transaction';

/**
 * Transaction document interface for MongoDB
 */
export interface ITransactionDocument extends Document {
  type: TransactionType;
  amount: number;
  fromAccountId: string | null;
  toAccountId: string | null;
  description: string;
  status: TransactionStatus;
  uuid: string;
  createdAt: Date;
}

/**
 * Transaction schema for MongoDB
 */
const TransactionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    fromAccountId: {
      type: String,
      default: null,
    },
    toAccountId: {
      type: String,
      default: null,
    },
    uuid: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);