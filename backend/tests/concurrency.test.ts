import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PayoutService } from '../src/services/payoutService';
import { Campaign } from '../src/models/Campaign';
import { Submission } from '../src/models/Submission';
import { User } from '../src/models/User';
import { IMilestone } from '../src/types';

describe('Concurrency & Race Condition Stress Tests', () => {
  let mongoServer: MongoMemoryServer;

  const milestoneLadder: IMilestone[] = [
    { views: 10000, payout: 500 },
    { views: 50000, payout: 2000 }
  ];

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Submission.deleteMany({});
  });

  test('Stretch Goal: 10 simultaneous view updates NEVER overspend campaign budget', async () => {
    const brand = await User.create({
      name: 'Brand Concurrent',
      email: 'brand_concurrent@test.com',
      passwordHash: 'hash',
      role: 'brand'
    });

    // Total budget is strictly ₹2,000
    const campaign = await Campaign.create({
      name: 'Concurrent Stress Campaign',
      platform: 'Instagram',
      totalBudget: 2000,
      spentBudget: 0,
      milestoneLadder,
      brandId: brand._id
    });

    // Create 10 creators and 10 submissions
    // If all 10 claimed ₹500, that would be ₹5,000 (an overspend of ₹3,000 without guards!)
    const submissions = [];
    for (let i = 0; i < 10; i++) {
      const creator = await User.create({
        name: `Creator ${i}`,
        email: `creator_${i}@test.com`,
        passwordHash: 'hash',
        role: 'creator'
      });

      const sub = await Submission.create({
        campaignId: campaign._id,
        creatorId: creator._id,
        postUrl: `https://instagram.com/p/concurrent_${i}`,
        platform: 'Instagram',
        currentViews: 0,
        currentPayout: 0
      });

      submissions.push(sub);
    }

    // Fire all 10 updates concurrently at the exact same millisecond
    const updatePromises = submissions.map((sub) =>
      PayoutService.processViewUpdate(sub._id.toString(), 15000) // 15k views qualifies for ₹500
    );

    const results = await Promise.all(updatePromises);

    // Sum of all payout increments
    const totalIncrementAwarded = results.reduce((sum, r) => sum + r.payoutIncrement, 0);

    // Fetch refreshed campaign from DB
    const refreshedCampaign = await Campaign.findById(campaign._id);

    // Fetch all submissions from DB
    const refreshedSubmissions = await Submission.find({ campaignId: campaign._id });
    const totalSubmissionPayouts = refreshedSubmissions.reduce((sum, s) => sum + s.currentPayout, 0);

    // Strict assertions:
    // 1. Total increment awarded across all parallel promises must NOT exceed 2000
    expect(totalIncrementAwarded).toBeLessThanOrEqual(2000);
    expect(totalIncrementAwarded).toBe(2000);

    // 2. Campaign spentBudget must equal exactly 2000 (100% budget utilized, 0 overspend)
    expect(refreshedCampaign?.spentBudget).toBe(2000);
    expect(refreshedCampaign?.remainingBudget).toBe(0);

    // 3. Sum of payouts stored on all submissions must equal campaign spentBudget
    expect(totalSubmissionPayouts).toBe(2000);
  });

  test('Stretch Goal: Repeated concurrent updates to the same submission never double-pay', async () => {
    const brand = await User.create({
      name: 'Brand Repeat',
      email: 'brand_repeat@test.com',
      passwordHash: 'hash',
      role: 'brand'
    });

    const campaign = await Campaign.create({
      name: 'Repeat Test Campaign',
      platform: 'YouTube',
      totalBudget: 10000,
      spentBudget: 0,
      milestoneLadder,
      brandId: brand._id
    });

    const creator = await User.create({
      name: 'Creator Repeat',
      email: 'creator_repeat@test.com',
      passwordHash: 'hash',
      role: 'creator'
    });

    const submission = await Submission.create({
      campaignId: campaign._id,
      creatorId: creator._id,
      postUrl: 'https://youtube.com/watch?v=repeat_test',
      platform: 'YouTube',
      currentViews: 0,
      currentPayout: 0
    });

    // 5 repeated simultaneous calls for the same submission at 12k views
    const repeatedPromises = [
      PayoutService.processViewUpdate(submission._id.toString(), 12000),
      PayoutService.processViewUpdate(submission._id.toString(), 12000),
      PayoutService.processViewUpdate(submission._id.toString(), 12000),
      PayoutService.processViewUpdate(submission._id.toString(), 12000),
      PayoutService.processViewUpdate(submission._id.toString(), 12000)
    ];

    const results = await Promise.all(repeatedPromises);
    const totalAwarded = results.reduce((sum, r) => sum + r.payoutIncrement, 0);

    const refreshedSub = await Submission.findById(submission._id);
    const refreshedCamp = await Campaign.findById(campaign._id);

    // Submission should only be paid ₹500 ONCE, not 5 times (₹2,500)
    expect(totalAwarded).toBe(500);
    expect(refreshedSub?.currentPayout).toBe(500);
    expect(refreshedCamp?.spentBudget).toBe(500);
  });
});
