import mongoose, { Document, Schema } from 'mongoose';
import { ISubmission, IViewHistoryEntry } from '../types';

export interface ISubmissionDocument extends Omit<ISubmission, '_id'>, Document {}

const viewHistorySchema = new Schema<IViewHistoryEntry>(
  {
    views: { type: Number, required: true },
    payoutIncrement: { type: Number, required: true },
    cumulativePayout: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    flagged: { type: Boolean, default: false },
    spikeReason: { type: String }
  },
  { _id: false }
);

const submissionSchema = new Schema<ISubmissionDocument>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Campaign ID is required'],
      index: true
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
      index: true
    },
    postUrl: {
      type: String,
      required: [true, 'Post URL is required'],
      trim: true
    },
    platform: {
      type: String,
      enum: ['Instagram', 'YouTube'],
      required: [true, 'Platform is required']
    },
    currentViews: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    currentPayout: {
      type: Number,
      default: 0,
      min: [0, 'Payout cannot be negative']
    },
    highestMilestoneReached: {
      views: { type: Number, default: 0 },
      payout: { type: Number, default: 0 }
    },
    viewHistory: {
      type: [viewHistorySchema],
      default: []
    },
    flaggedForSpike: {
      type: Boolean,
      default: false
    },
    spikeReason: {
      type: String
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'FLAGGED'],
      default: 'APPROVED'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate submission of the same post url in the same campaign
submissionSchema.index({ campaignId: 1, postUrl: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmissionDocument>('Submission', submissionSchema);
