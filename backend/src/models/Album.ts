/**
 * Album Model
 * Mongoose schema for photo albums
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAlbum extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  coverPhotoId?: mongoose.Types.ObjectId;
  photoCount: number;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const albumSchema = new Schema<IAlbum>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    coverPhotoId: {
      type: Schema.Types.ObjectId,
      ref: 'Photo',
    },
    photoCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: Document, ret: Record<string, unknown>) => {
        if (ret._id && typeof ret._id !== 'string') {
          ret._id = (ret._id as mongoose.Types.ObjectId).toString();
        }
        if (ret.userId && typeof ret.userId !== 'object') {
          ret.userId = (ret.userId as mongoose.Types.ObjectId).toString();
        }
        if (ret.coverPhotoId && typeof ret.coverPhotoId !== 'object') {
          ret.coverPhotoId = (ret.coverPhotoId as mongoose.Types.ObjectId).toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
albumSchema.index({ userId: 1, createdAt: -1 });
albumSchema.index({ userId: 1, sortOrder: 1 });
albumSchema.index({ userId: 1, published: 1 });

export const Album: Model<IAlbum> = mongoose.model<IAlbum>('Album', albumSchema);
