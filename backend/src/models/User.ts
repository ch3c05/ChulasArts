/**
 * User Model
 * Mongoose schema for user accounts
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// Extend User interface for Mongoose document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  bio: string;
  avatarUrl: string;
  albumCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    albumCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: Document, ret: Record<string, unknown>) => {
        ret._id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
// Note: email index is created automatically via unique: true in schema
userSchema.index({ createdAt: -1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
