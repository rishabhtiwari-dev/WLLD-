import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PayoutService } from '../src/services/payoutService';
import { SpikeDetectionService } from '../src/services/spikeService';
import { Campaign } from '../src/models/Campaign';
import { Submission } from '../src/models/Submission';
import { User } from '../src/models/User';
import { IMilestone } from '../src/types';

describe('PayoutService Unit & Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  const sampleLadder: IMilestone[] = [
    { views: 10000, payout: 500 },
    { views: 50000, payout: 2000 },
    { views: 100000, payout: 5000 }
  ];

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 70000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({});
      await Campaign.deleteMany({});
      await Submission.deleteMany({});
    }
  });

  describe('1. Pure Unit Tests: Payout Calculation Logic', () => {
    test('Should return ₹0 when views are below the first milestone', () => {
      const result = PayoutService.calculateMilestonePayout(sampleLadder, 5000);
      expect(result.highestMilestone).toBeNull();
      expect(result.targetPayout).toBe(0);
    });

    test('Should return ₹500 when views reach exactly the first milestone (10k)', () => {
      const result = PayoutService.calculateMilestonePayout(sampleLadder, 10000);
      expect(result.highestMilestone).toEqual({ views: 10000, payout: 500 });
      expect(result.targetPayout).toBe(500);
    });

    test('Should return ₹500 when views are between milestone 1 and 2 (e.g. 35k)', () => {
      const result = PayoutService.calculateMilestonePayout(sampleLadder, 35000);
      expect(result.highestMilestone).toEqual({ views: 10000, payout: 500 });
      expect(result.targetPayout).toBe(500);
    });

    test('Should return ₹2,000 when views cross milestone 2 (50k)', () => {
      const result = PayoutService.calculateMilestonePayout(sampleLadder, 50000);
      expect(result.highestMilestone).toEqual({ views: 50000, payout: 2000 });
      expect(result.targetPayout).toBe(2000);
    });

    test('Should return ₹5,000 when views cross the highest milestone (100k+)', () => {
      const result = PayoutService.calculateMilestonePayout(sampleLadder, 250000);
      expect(result.highestMilestone).toEqual({ views: 100000, payout: 5000 });
      expect(result.targetPayout).toBe(5000);
    });

    test('Repeated updates with no new milestone crossed should have payoutDelta = 0 (NO double-pay)', () => {
      const result = PayoutService.computePayoutIncrement(sampleLadder, 50000, 65000, 2000);
      expect(result.targetPayout).toBe(2000);
      expect(result.payoutDelta).toBe(0);
    });

    test('Progressing from milestone 1 to milestone 2 should calculate incremental difference only', () => {
      const result = PayoutService.computePayoutIncrement(sampleLadder, 10000, 50000, 500);
      expect(result.targetPayout).toBe(2000);
      expect(result.payoutDelta).toBe(1500);
    });

    test('A post crossing multiple milestones at once (0 to 110k) awards the highest milestone payout directly', () => {
      const result = PayoutService.computePayoutIncrement(sampleLadder, 0, 110000, 0);
      expect(result.targetPayout).toBe(5000);
      expect(result.payoutDelta).toBe(5000);
    });

    test('View decrease edge case should never produce negative payout or clawback', () => {
      const result = PayoutService.computePayoutIncrement(sampleLadder, 100000, 40000, 5000);
      expect(result.payoutDelta).toBe(0);
    });
  });

  describe('2. Integration Tests: Budget Cap Enforcement', () => {
    test('A campaign must never pay out more than its remaining budget (Full Cap)', async () => {
      const brand = await User.create({
        name: 'Brand Co',
        email: 'brand@test.com',
        passwordHash: 'hash',
        role: 'brand'
      });

      const creator = await User.create({
        name: 'Creator One',
        email: 'creator@test.com',
        passwordHash: 'hash',
        role: 'creator'
      });

      // Campaign with totalBudget of ₹1,000 only
      const campaign = await Campaign.create({
        name: 'Strict Budget Campaign',
        platform: 'Instagram',
        totalBudget: 1000,
        spentBudget: 0,
        milestoneLadder: sampleLadder, // 10k -> 500, 50k -> 2000, 100k -> 5000
        brandId: brand._id
      });

      const submission = await Submission.create({
        campaignId: campaign._id,
        creatorId: creator._id,
        postUrl: 'https://instagram.com/p/test1',
        platform: 'Instagram',
        currentViews: 0,
        currentPayout: 0
      });

      // Views jump to 60,000 (qualifies for ₹2,000 milestone)
      // BUT campaign budget is only ₹1,000!
      const updateResult = await PayoutService.processViewUpdate(
        submission._id.toString(),
        60000
      );

      // Payout must be capped at the campaign total budget ₹1,000
      expect(updateResult.payoutIncrement).toBe(1000);
      expect(updateResult.partialPayout).toBe(true);
      expect(updateResult.budgetExhausted).toBe(true);

      const refreshedSubmission = await Submission.findById(submission._id);
      expect(refreshedSubmission?.currentPayout).toBe(1000);

      const refreshedCampaign = await Campaign.findById(campaign._id);
      expect(refreshedCampaign?.spentBudget).toBe(1000);
      expect(refreshedCampaign?.remainingBudget).toBe(0);
    });

    test('Multiple submissions stop paying once budget reaches zero', async () => {
      const brand = await User.create({
        name: 'Brand Co',
        email: 'brand2@test.com',
        passwordHash: 'hash',
        role: 'brand'
      });

      const creatorA = await User.create({
        name: 'Creator A',
        email: 'creatorA@test.com',
        passwordHash: 'hash',
        role: 'creator'
      });

      const creatorB = await User.create({
        name: 'Creator B',
        email: 'creatorB@test.com',
        passwordHash: 'hash',
        role: 'creator'
      });

      // Campaign budget ₹700
      const campaign = await Campaign.create({
        name: 'Limited Budget Campaign',
        platform: 'Instagram',
        totalBudget: 700,
        spentBudget: 0,
        milestoneLadder: sampleLadder, // 10k -> 500
        brandId: brand._id
      });

      const subA = await Submission.create({
        campaignId: campaign._id,
        creatorId: creatorA._id,
        postUrl: 'https://instagram.com/p/subA',
        platform: 'Instagram',
        currentViews: 0,
        currentPayout: 0
      });

      const subB = await Submission.create({
        campaignId: campaign._id,
        creatorId: creatorB._id,
        postUrl: 'https://instagram.com/p/subB',
        platform: 'Instagram',
        currentViews: 0,
        currentPayout: 0
      });

      // Submission A reaches 12k views -> crosses 10k milestone (needs ₹500)
      const resA = await PayoutService.processViewUpdate(subA._id.toString(), 12000);
      expect(resA.payoutIncrement).toBe(500);

      const campAfterA = await Campaign.findById(campaign._id);
      expect(campAfterA?.spentBudget).toBe(500);
      expect(campAfterA?.remainingBudget).toBe(200);

      // Submission B reaches 15k views -> crosses 10k milestone (needs ₹500, but only ₹200 left)
      const resB = await PayoutService.processViewUpdate(subB._id.toString(), 15000);
      expect(resB.payoutIncrement).toBe(200);
      expect(resB.partialPayout).toBe(true);
      expect(resB.budgetExhausted).toBe(true);

      const campAfterB = await Campaign.findById(campaign._id);
      expect(campAfterB?.spentBudget).toBe(700);
      expect(campAfterB?.remainingBudget).toBe(0);

      // Now sub A reaches 50k views (needs another ₹1,500) -> ₹0 paid because budget is 0
      const resA2 = await PayoutService.processViewUpdate(subA._id.toString(), 52000);
      expect(resA2.payoutIncrement).toBe(0);
      expect(resA2.budgetExhausted).toBe(true);

      const campFinal = await Campaign.findById(campaign._id);
      expect(campFinal?.spentBudget).toBe(700);
    });
  });

  describe('3. Bonus: View Spike Anomaly Detection', () => {
    test('Flags unusual surge when views jump >= 50,000 rapidly', () => {
      const history = [
        {
          views: 1000,
          payoutIncrement: 0,
          cumulativePayout: 0,
          timestamp: new Date(Date.now() - 20000) // 20s ago
        }
      ];

      const check = SpikeDetectionService.analyzeViewUpdate(1000, 60000, history, new Date());
      expect(check.isSpike).toBe(true);
      expect(check.reason).toContain('Rapid surge detected');
    });

    test('Does not flag gradual view growth', () => {
      const history = [
        {
          views: 5000,
          payoutIncrement: 0,
          cumulativePayout: 0,
          timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        }
      ];

      const check = SpikeDetectionService.analyzeViewUpdate(5000, 12000, history, new Date());
      expect(check.isSpike).toBe(false);
    });
  });
});
