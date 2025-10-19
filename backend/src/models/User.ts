/**
 * User Model
 * Mongoose schema for user accounts
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// Extend User interface for Mongoose document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  bio?: string;
  profilePictureUrl?: string;
  websiteUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  albumCount: number;
  photoCount: number;
  followerCount: number;
  followingCount: number;
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
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_-]+$/,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    profilePictureUrl: {
      type: String,
    },
    websiteUrl: {
      type: String,
      maxlength: 200,
    },
    socialLinks: {
      instagram: String,
      twitter: String,
      facebook: String,
    },
    albumCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    photoCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString();
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
