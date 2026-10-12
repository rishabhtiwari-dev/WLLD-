import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'brand' | 'creator';
export type PlatformType = 'Instagram' | 'YouTube';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'FLAGGED';
export type CampaignStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export interface IMilestone {
  views: number;
  payout: number;
}

export interface IViewHistoryEntry {
  views: number;
  payoutIncrement: number;
  cumulativePayout: number;
  timestamp: Date;
  flagged?: boolean;
  spikeReason?: string;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaign {
  _id: Types.ObjectId;
  name: string;
  platform: PlatformType;
  totalBudget: number;
  spentBudget: number;
  remainingBudget?: number;
  milestoneLadder: IMilestone[];
  brandId: Types.ObjectId | IUser;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmission {
  _id: Types.ObjectId;
  campaignId: Types.ObjectId | ICampaign;
  creatorId: Types.ObjectId | IUser;
  postUrl: string;
  platform: PlatformType;
  currentViews: number;
  currentPayout: number;
  highestMilestoneReached: IMilestone | null;
  viewHistory: IViewHistoryEntry[];
  flaggedForSpike: boolean;
  spikeReason?: string;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}
