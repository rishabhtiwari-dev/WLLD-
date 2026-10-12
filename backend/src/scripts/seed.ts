import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { Submission } from '../models/Submission';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding database...');

    // Clean existing data
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Submission.deleteMany({});

    // Create users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const brandUser = await User.create({
      name: 'Red Bull Marketing',
      email: 'brand@memed.com',
      passwordHash,
      role: 'brand'
    });

    const creator1 = await User.create({
      name: 'Aarav (DailyMemeDrop)',
      email: 'creator@memed.com',
      passwordHash,
      role: 'creator'
    });

    const creator2 = await User.create({
      name: 'Priya (EpicClipsHQ)',
      email: 'priya@memed.com',
      passwordHash,
      role: 'creator'
    });

    console.log('✅ Created Demo Users:');
    console.log('   Brand:   brand@memed.com / password123');
    console.log('   Creator: creator@memed.com / password123');
    console.log('   Creator: priya@memed.com / password123');

    // Create campaigns
    const campaign1 = await Campaign.create({
      name: 'Red Bull Energy Meme Challenge',
      platform: 'Instagram',
      totalBudget: 50000,
      spentBudget: 2500, // 2000 for creator1 + 500 for creator2
      milestoneLadder: [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 },
        { views: 100000, payout: 5000 }
      ],
      brandId: brandUser._id,
      status: 'ACTIVE'
    });

    const campaign2 = await Campaign.create({
      name: 'Valorant Clutch Plays Series',
      platform: 'YouTube',
      totalBudget: 25000,
      spentBudget: 0,
      milestoneLadder: [
        { views: 5000, payout: 300 },
        { views: 25000, payout: 1200 },
        { views: 75000, payout: 4000 }
      ],
      brandId: brandUser._id,
      status: 'ACTIVE'
    });

    const campaign3 = await Campaign.create({
      name: 'Flash Budget Test Campaign',
      platform: 'Instagram',
      totalBudget: 1500, // Low budget to demonstrate cap!
      spentBudget: 0,
      milestoneLadder: [
        { views: 10000, payout: 500 },
        { views: 50000, payout: 2000 }
      ],
      brandId: brandUser._id,
      status: 'ACTIVE'
    });

    console.log('✅ Created 3 Campaigns');

    // Create submissions
    const sub1 = await Submission.create({
      campaignId: campaign1._id,
      creatorId: creator1._id,
      postUrl: 'https://instagram.com/p/C_testMeme123',
      platform: 'Instagram',
      currentViews: 62000,
      currentPayout: 2000, // crossed 50k milestone
      highestMilestoneReached: { views: 50000, payout: 2000 },
      viewHistory: [
        { views: 0, payoutIncrement: 0, cumulativePayout: 0, timestamp: new Date(Date.now() - 86400000 * 2) },
        { views: 12000, payoutIncrement: 500, cumulativePayout: 500, timestamp: new Date(Date.now() - 86400000) },
        { views: 62000, payoutIncrement: 1500, cumulativePayout: 2000, timestamp: new Date() }
      ],
      status: 'APPROVED'
    });

    const sub2 = await Submission.create({
      campaignId: campaign1._id,
      creatorId: creator2._id,
      postUrl: 'https://instagram.com/p/D_testMeme456',
      platform: 'Instagram',
      currentViews: 15000,
      currentPayout: 500, // crossed 10k milestone
      highestMilestoneReached: { views: 10000, payout: 500 },
      viewHistory: [
        { views: 0, payoutIncrement: 0, cumulativePayout: 0, timestamp: new Date(Date.now() - 86400000) },
        { views: 15000, payoutIncrement: 500, cumulativePayout: 500, timestamp: new Date() }
      ],
      status: 'APPROVED'
    });

    console.log('✅ Created 2 Submissions with initial payouts');
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seed();
