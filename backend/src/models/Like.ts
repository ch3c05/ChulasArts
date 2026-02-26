/**
 * Like Model
 * Mongoose schema for photo likes
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILike extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  photoId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
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
      transform: (_doc: Document, ret: Record<string, unknown>) => {
        return {
          _id:
            ret._id && typeof ret._id !== 'string'
              ? (ret._id as mongoose.Types.ObjectId).toString()
              : ret._id,
          userId:
            ret.userId && typeof ret.userId !== 'object'
              ? (ret.userId as mongoose.Types.ObjectId).toString()
              : ret.userId,
          photoId:
            ret.photoId && typeof ret.photoId !== 'object'
              ? (ret.photoId as mongoose.Types.ObjectId).toString()
              : ret.photoId,
          createdAt: ret.createdAt,
        };
      },
    },
  }
);

// Compound index for unique user-photo combination
likeSchema.index({ userId: 1, photoId: 1 }, { unique: true });
likeSchema.index({ photoId: 1, createdAt: -1 });

export const Like: Model<ILike> = mongoose.model<ILike>('Like', likeSchema);
