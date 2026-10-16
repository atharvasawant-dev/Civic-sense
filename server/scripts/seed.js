// server/scripts/seed.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

async function seed() {
  const isProd = process.env.NODE_ENV === 'production';
  const targetDbName = mongoose.connection.name || 'civic_sense';

  // Safety guard against accidental execution on production databases
  if (isProd && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error('⛔ FATAL: Cannot run seed script in production without ALLOW_PRODUCTION_SEED=true.');
    console.error('   To run safely: ALLOW_PRODUCTION_SEED=true npm run seed');
    process.exit(1);
  }

  console.log('🌱 Connecting to database via connectDB()...');
  await connectDB();

  console.log(`\n============================================================`);
  console.log(`📦 Seed Target Database: [${mongoose.connection.name || 'default'}]`);
  console.log(`============================================================\n`);

  // ============================================================
  // 1. ADMIN ACCOUNT MANAGEMENT (Zero hardcoded admin123)
  // ============================================================
  let adminUser = null;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 8) {
      console.error('❌ ERROR: ADMIN_PASSWORD must be at least 8 characters long for security.');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase().trim() });
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`👑 Updated existing user ${adminEmail} to admin role.`);
      } else {
        console.log(`👑 Existing admin account found: ${adminEmail} (preserved).`);
      }
      adminUser = existingAdmin;
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = await User.create({
        name: process.env.ADMIN_NAME || 'Municipal Administrator',
        email: adminEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: 'admin',
        bio: 'Civic Grievance Redressal Cell — Central Municipal Corporation.',
        pincode: process.env.ADMIN_PINCODE || '400001',
      });
      console.log(`✅ Created designated admin account: ${adminEmail}`);
    }
  } else {
    // Check if an admin already exists in the database
    const existingAnyAdmin = await User.findOne({ role: 'admin' });
    if (existingAnyAdmin) {
      console.log(`👑 Existing admin found in database: ${existingAnyAnyAdmin ? existingAnyAdmin.email : ''} (reusing for official responses).`);
      adminUser = existingAnyAdmin;
    } else {
      console.log('⚠️ [SECURITY] No ADMIN_EMAIL and ADMIN_PASSWORD provided in environment.');
      console.log('   Skipping admin account creation. (Hardcoded credentials like "admin123" are strictly prohibited).');
      console.log('   To create an admin: set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
    }
  }

  // ============================================================
  // 2. DEMO CITIZEN ACCOUNTS (Idempotent reuse)
  // ============================================================
  const citizenPassword = process.env.DEMO_CITIZEN_PASSWORD || 'CitizenDemo#2026';
  const citizenPasswordHash = await bcrypt.hash(citizenPassword, 10);

  // Citizen 1: Aarav Sharma
  let citizenAarav = await User.findOne({ email: 'citizen@civicsense.org' });
  if (!citizenAarav) {
    citizenAarav = await User.create({
      name: 'Aarav Sharma',
      email: 'citizen@civicsense.org',
      password: citizenPasswordHash,
      role: 'user',
      bio: 'Community advocate for pedestrian safety and pothole-free roads.',
      pincode: '400050',
    });
    console.log('✅ Created citizen account: citizen@civicsense.org (Aarav Sharma)');
  } else {
    console.log('ℹ️ Citizen account already exists: citizen@civicsense.org (reusing)');
  }

  // Citizen 2: Priya Patel
  let citizenPriya = await User.findOne({ email: 'priya@civicsense.org' });
  if (!citizenPriya) {
    citizenPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya@civicsense.org',
      password: citizenPasswordHash,
      role: 'user',
      bio: 'Active resident tracking municipal solid waste and storm drainage.',
      pincode: '400052',
    });
    console.log('✅ Created citizen account: priya@civicsense.org (Priya Patel)');
  } else {
    console.log('ℹ️ Citizen account already exists: priya@civicsense.org (reusing)');
  }

  // Official actor for administrative responses and status notifications
  const officialActor = adminUser || citizenAarav;

  // ============================================================
  // 3. REALISTIC CIVIC REPORTS (Idempotent - checked by title)
  // ============================================================
  const demoIssues = [
    {
      title: 'Severe Crater Pothole on Hill Road Junction',
      description:
        'A deep 2-foot wide pothole right after the traffic signal near St. Andrew’s Church. Multiple two-wheelers have skidded here during rain. Extreme hazard to evening commuters.',
      category: 'Pothole',
      landmark: 'Opposite St. Andrew’s Church, Hill Road, Bandra West',
      pincode: '400050',
      status: 'In Progress',
      user: citizenAarav._id,
      date: new Date(Date.now() - 36 * 3600 * 1000), // 36 hours ago
      score: 2,
      upvotesCount: 2,
      downvotesCount: 0,
      commentsCount: 2,
      comments: [
        {
          author: citizenPriya._id,
          content: 'I saw a bike slip here two days ago. So relieved this was flagged!',
          reply: adminUser
            ? {
                author: adminUser._id,
                content:
                  'Grievance inspected by Ward H/West Road Engineering. Cold-mix asphalt patching crew has been scheduled for tonight at 11:00 PM.',
              }
            : null,
        },
      ],
      notifications: [
        {
          recipient: citizenAarav._id,
          sender: officialActor._id,
          type: 'status_change',
          message: 'Your report "Severe Crater Pothole on Hill Road Junction" status updated to: In Progress',
          read: false,
        },
        {
          recipient: citizenAarav._id,
          sender: citizenPriya._id,
          type: 'comment',
          message: 'Priya Patel commented on your report: "Severe Crater Pothole on Hill Road Junction"',
          read: false,
        },
      ],
    },
    {
      title: 'Overflowing Community Garbage Bin Blocking Sidewalk',
      description:
        'Community waste bin on 14th Road has not been cleared by sanitation trucks for 4 days. Waste is spilling over onto the pavement and stray dogs are scattering litter across the lane.',
      category: 'Garbage',
      landmark: 'Near Municipal Secondary School, 14th Road, Khar West',
      pincode: '400052',
      status: 'Pending',
      user: citizenPriya._id,
      date: new Date(Date.now() - 14 * 3600 * 1000), // 14 hours ago
      score: 1,
      upvotesCount: 1,
      downvotesCount: 0,
      commentsCount: 1,
      comments: [
        {
          author: citizenAarav._id,
          content: 'The stench is reaching nearby apartments. Escalated to the ward sanitation supervisor.',
        },
      ],
      notifications: [
        {
          recipient: citizenPriya._id,
          sender: citizenAarav._id,
          type: 'comment',
          message: 'Aarav Sharma commented on your report: "Overflowing Community Garbage Bin Blocking Sidewalk"',
          read: false,
        },
      ],
    },
    {
      title: 'High-Pressure Underground Water Pipeline Rupture',
      description:
        'Treated drinking water main line burst near the park gate. Thousands of liters of clean potable water flooded the street for over 8 hours.',
      category: 'Water Leakage',
      landmark: 'Shivaji Park Entrance Gate 3, Dadar West',
      pincode: '400028',
      status: 'Resolved',
      user: citizenAarav._id,
      date: new Date(Date.now() - 72 * 3600 * 1000), // 3 days ago
      score: 2,
      upvotesCount: 2,
      downvotesCount: 0,
      commentsCount: 1,
      comments: [
        {
          author: officialActor._id,
          content:
            'Hydraulic engineering team isolated the line, replaced the ruptured 300mm gasket, and restored normal water supply at 15:30 HRS. Ticket closed as Resolved.',
        },
      ],
      notifications: [
        {
          recipient: citizenAarav._id,
          sender: officialActor._id,
          type: 'status_change',
          message: 'Your report "High-Pressure Underground Water Pipeline Rupture" has been Resolved by authorities! 🎉',
          read: true,
        },
      ],
    },
    {
      title: '8 Consecutive Streetlamps Non-Functional Along Residential Lane',
      description:
        'Pitch dark stretch between 5th and 8th cross roads for the past week. Working women and elderly citizens feel unsafe walking after sunset.',
      category: 'Streetlight',
      landmark: '5th to 8th Cross Lane, Santacruz West',
      pincode: '400054',
      status: 'In Progress',
      user: citizenPriya._id,
      date: new Date(Date.now() - 48 * 3600 * 1000), // 2 days ago
      score: 1,
      upvotesCount: 1,
      downvotesCount: 0,
      commentsCount: 0,
    },
    {
      title: 'Pre-Monsoon Stormwater Nullah Clogged with Construction Debris',
      description:
        'Drainage canal choked with discarded cement sacks and rubble. Water is already backing up during light showers and threatens ground floor housing.',
      category: 'Drainage',
      landmark: 'Behind Market Yard, Kurla West',
      pincode: '400070',
      status: 'Pending',
      user: citizenAarav._id,
      date: new Date(Date.now() - 5 * 3600 * 1000), // 5 hours ago
      score: 1,
      upvotesCount: 1,
      downvotesCount: 0,
      commentsCount: 0,
    },
    {
      title: 'Unattended Construction Rubble Blocking Wheelchair Ramp',
      description:
        'Commercial shop renovation left a large pile of gravel and tiles on the pedestrian ramp, completely obstructing accessibility.',
      category: 'Other',
      landmark: 'Corner of SV Road & Station Approach, Andheri West',
      pincode: '400058',
      status: 'Resolved',
      user: citizenPriya._id,
      date: new Date(Date.now() - 96 * 3600 * 1000), // 4 days ago
      score: 1,
      upvotesCount: 1,
      downvotesCount: 0,
      commentsCount: 1,
      comments: [
        {
          author: officialActor._id,
          content:
            'Notice issued to shop owner under Municipal Solid Waste Bye-laws. Encroachment squad cleared the ramp this morning.',
        },
      ],
      notifications: [
        {
          recipient: citizenPriya._id,
          sender: officialActor._id,
          type: 'status_change',
          message: 'Your report "Unattended Construction Rubble Blocking Wheelchair Ramp" has been Resolved by authorities! 🎉',
          read: true,
        },
      ],
    },
  ];

  console.log('\n📌 Processing realistic civic issues (idempotent)...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const item of demoIssues) {
    const existing = await Issue.findOne({ title: item.title });
    if (existing) {
      console.log(`⏩ Skipping existing issue: "${item.title}"`);
      skippedCount++;
      continue;
    }

    const { comments, notifications, ...issuePayload } = item;
    const issue = await Issue.create(issuePayload);
    createdCount++;
    console.log(`✅ Created issue: "${issue.title}" [${issue.status}] (${issue.category})`);

    // Insert Votes (idempotent check)
    const voters = [citizenAarav._id, citizenPriya._id];
    if (adminUser) voters.push(adminUser._id);
    for (const voterId of voters.slice(0, issue.upvotesCount)) {
      const voteExists = await Vote.findOne({ issue: issue._id, user: voterId });
      if (!voteExists) {
        await Vote.create({ issue: issue._id, user: voterId, value: 1 });
      }
    }

    // Insert Comments
    if (comments && comments.length > 0) {
      for (const c of comments) {
        const commentDoc = await Comment.create({
          issue: issue._id,
          user: c.author,
          content: c.content,
        });

        if (c.reply) {
          await Comment.create({
            issue: issue._id,
            user: c.reply.author,
            content: c.reply.content,
            parentComment: commentDoc._id,
          });
        }
      }
    }

    // Insert Notifications
    if (notifications && notifications.length > 0) {
      for (const n of notifications) {
        const notifExists = await Notification.findOne({
          recipient: n.recipient,
          message: n.message,
        });
        if (!notifExists) {
          await Notification.create({
            recipient: n.recipient,
            sender: n.sender,
            issue: issue._id,
            type: n.type,
            message: n.message,
            read: n.read,
          });
        }
      }
    }
  }

  console.log('\n============================================================');
  console.log('✨ SEED ROUTINE SUMMARY:');
  console.log(`   Created Issues: ${createdCount}`);
  console.log(`   Skipped Existing Issues: ${skippedCount}`);
  console.log('============================================================');

  if (adminUser) {
    console.log(`👑 Admin Account:     ${adminUser.email}`);
  } else {
    console.log('⚠️ Admin Account:     Not configured in this run');
  }
  console.log(`🙋 Citizen Account 1: citizen@civicsense.org (Password: ${process.env.DEMO_CITIZEN_PASSWORD ? 'configured via env' : 'CitizenDemo#2026'})`);
  console.log(`🙋 Citizen Account 2: priya@civicsense.org   (Password: ${process.env.DEMO_CITIZEN_PASSWORD ? 'configured via env' : 'CitizenDemo#2026'})`);
  console.log('============================================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
