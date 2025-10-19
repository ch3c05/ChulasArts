/**
 * Bookmark Model
 * Mongoose schema for photo bookmarks
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  photoId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    photoId: {
      type: Schema.Types.ObjectId,
      ref: 'Photo',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString();
        ret.userId = ret.userId.toString();
        ret.photoId = ret.photoId.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for unique user-photo combination
bookmarkSchema.index({ userId: 1, photoId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ photoId: 1 });

export const Bookmark: Model<IBookmark> = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
