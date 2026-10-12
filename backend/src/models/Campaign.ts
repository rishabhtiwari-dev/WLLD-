import mongoose, { Document, Schema } from 'mongoose';
import { ICampaign, IMilestone } from '../types';

export interface ICampaignDocument extends Omit<ICampaign, '_id'>, Document {
  remainingBudget: number;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    views: {
      type: Number,
      required: true,
      min: [1, 'Milestone views must be greater than 0']
    },
    payout: {
      type: Number,
      required: true,
      min: [0, 'Milestone payout cannot be negative']
    }
  },
  { _id: false }
);

const campaignSchema = new Schema<ICampaignDocument>(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      maxlength: 200
    },
    platform: {
      type: String,
      enum: ['Instagram', 'YouTube'],
      required: [true, 'Platform is required (Instagram or YouTube)']
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [1, 'Total budget must be at least ₹1']
    },
    spentBudget: {
      type: Number,
      default: 0,
      min: [0, 'Spent budget cannot be negative']
    },
    milestoneLadder: {
      type: [milestoneSchema],
      required: [true, 'Milestone ladder is required'],
      validate: {
        validator: function (ladder: IMilestone[]) {
          if (!ladder || ladder.length === 0) return false;
          // Verify that views and payouts are strictly increasing
          for (let i = 1; i < ladder.length; i++) {
            if (ladder[i].views <= ladder[i - 1].views) return false;
            if (ladder[i].payout <= ladder[i - 1].payout) return false;
          }
          return true;
        },
        message: 'Milestones must be ordered with strictly increasing view thresholds and payouts'
      }
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'PAUSED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

campaignSchema.virtual('remainingBudget').get(function (this: ICampaignDocument) {
  return Math.max(0, this.totalBudget - this.spentBudget);
});

export const Campaign = mongoose.model<ICampaignDocument>('Campaign', campaignSchema);

