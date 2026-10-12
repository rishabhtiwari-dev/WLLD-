export type UserRole = 'brand' | 'creator';
export type PlatformType = 'Instagram' | 'YouTube';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface IMilestone {
  views: number;
  payout: number;
}

export interface ICampaign {
  _id: string;
  name: string;
  platform: PlatformType;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  milestoneLadder: IMilestone[];
  brandId: { _id: string; name: string; email: string } | string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  submissionCount?: number;
  createdAt: string;
}

export interface IViewHistoryEntry {
  views: number;
  payoutIncrement: number;
  cumulativePayout: number;
  timestamp: string;
  flagged?: boolean;
  spikeReason?: string;
}

export interface ISubmission {
  _id: string;
  campaignId: ICampaign | string;
  creatorId: { _id: string; name: string; email: string } | string;
  postUrl: string;
  platform: PlatformType;
  currentViews: number;
  currentPayout: number;
  highestMilestoneReached: IMilestone | null;
  viewHistory: IViewHistoryEntry[];
  flaggedForSpike: boolean;
  spikeReason?: string;
  status: 'PENDING' | 'APPROVED' | 'FLAGGED';
  createdAt: string;
}

export interface CreatorEarnings {
  totalEarnings: number;
  totalViews: number;
  totalSubmissions: number;
}

