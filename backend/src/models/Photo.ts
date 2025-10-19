/**
 * Photo Model
 * Mongoose schema for photos
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhoto extends Document {
  _id: mongoose.Types.ObjectId;
  albumId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  originalUrl: string;
  mediumUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  tags: string[];
  published: boolean;
  likeCount: number;
  bookmarkCount: number;
  viewCount: number;
  capturedAt?: Date;
  location?: string;
  camera?: string;
  lens?: string;
  focalLength?: number;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhoto>(
  {
    albumId: {
      type: Schema.Types.ObjectId,
      ref: 'Album',
      required: true,
      index: true,
    },
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
      maxlength: 2000,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    mediumUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
      min: 1,
    },
    height: {
      type: Number,
      required: true,
      min: 1,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
    mimeType: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // EXIF Metadata
    capturedAt: {
      type: Date,
    },
    location: {
      type: String,
      maxlength: 200,
    },
    camera: {
      type: String,
      maxlength: 100,
    },
    lens: {
      type: String,
      maxlength: 100,
    },
    focalLength: {
      type: Number,
      min: 0,
    },
    aperture: {
      type: String,
      maxlength: 20,
    },
    shutterSpeed: {
      type: String,
      maxlength: 20,
    },
    iso: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id.toString();
        ret.albumId = ret.albumId.toString();
        ret.userId = ret.userId.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
photoSchema.index({ albumId: 1, createdAt: -1 });
photoSchema.index({ userId: 1, published: 1, createdAt: -1 });
photoSchema.index({ published: 1, createdAt: -1 });
photoSchema.index({ published: 1, likeCount: -1 });
photoSchema.index({ tags: 1 });

export const Photo: Model<IPhoto> = mongoose.model<IPhoto>('Photo', photoSchema);
