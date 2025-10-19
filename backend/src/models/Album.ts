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
      transform: (_doc, ret) => {
        ret._id = ret._id.toString();
        ret.userId = ret.userId.toString();
        if (ret.coverPhotoId) {
          ret.coverPhotoId = ret.coverPhotoId.toString();
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
