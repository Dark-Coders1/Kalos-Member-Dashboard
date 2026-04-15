import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env.local');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['member', 'coach'], default: 'member' },
  },
  { timestamps: true }
);

const scanSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scanDate: { type: Date, required: true, index: true },
    weight: { type: Number, required: true },
    bodyFatPercent: { type: Number, required: true },
    leanMass: { type: Number, required: true },
    fatMass: { type: Number, required: true },
    visceralFat: { type: Number, default: 0 },
    source: { type: String, default: 'manual' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);

const members = [
  {
    name: 'Sarah Lee',
    email: 'sarah@kalos.demo',
    customScans: [
      { daysAgo: 210, weight: 186.4, bodyFatPercent: 32.1, leanMass: 121.6, fatMass: 59.8, visceralFat: 11.3 },
      { daysAgo: 165, weight: 182.1, bodyFatPercent: 29.8, leanMass: 123.9, fatMass: 54.3, visceralFat: 10.4 },
      { daysAgo: 120, weight: 183.5, bodyFatPercent: 30.5, leanMass: 125.2, fatMass: 55.9, visceralFat: 10.7 },
      { daysAgo: 70, weight: 179.3, bodyFatPercent: 27.1, leanMass: 126.7, fatMass: 48.6, visceralFat: 9.4 },
      { daysAgo: 20, weight: 177.8, bodyFatPercent: 25.4, leanMass: 128.3, fatMass: 45.2, visceralFat: 8.8 },
    ],
  },
  { name: 'Jordan Kim', email: 'jordan@kalos.demo', scans: 1 },
  { name: 'Alex Rivera', email: 'alex@kalos.demo', scans: 2 },
  { name: 'Priya Shah', email: 'priya@kalos.demo', scans: 4 },
  { name: 'Marcus Chen', email: 'marcus@kalos.demo', scans: 5 },
];

const buildScan = (index) => {
  const baseWeight = 185 - index * 1.5;
  const bodyFatPercent = 30 - index * 0.8;
  const leanMass = 122 + index * 0.7;
  const fatMass = baseWeight * (bodyFatPercent / 100);
  return {
    scanDate: new Date(Date.now() - (120 - index * 25) * 24 * 60 * 60 * 1000),
    weight: Number(baseWeight.toFixed(1)),
    bodyFatPercent: Number(bodyFatPercent.toFixed(1)),
    leanMass: Number(leanMass.toFixed(1)),
    fatMass: Number(fatMass.toFixed(1)),
    visceralFat: Number((9 - index * 0.2).toFixed(1)),
    source: 'seed',
  };
};

await Scan.deleteMany({});
await User.deleteMany({});

const passwordHash = await bcrypt.hash('kalos123', 10);

for (const member of members) {
  const user = await User.create({ name: member.name, email: member.email, passwordHash, role: 'member' });

  if (member.customScans?.length) {
    for (const scan of member.customScans) {
      await Scan.create({
        member: user._id,
        scanDate: new Date(Date.now() - scan.daysAgo * 24 * 60 * 60 * 1000),
        weight: scan.weight,
        bodyFatPercent: scan.bodyFatPercent,
        leanMass: scan.leanMass,
        fatMass: scan.fatMass,
        visceralFat: scan.visceralFat,
        source: 'seed',
      });
    }
  } else {
    for (let i = 0; i < member.scans; i++) {
      await Scan.create({ member: user._id, ...buildScan(i) });
    }
  }
}

await User.create({ name: 'Coach Demo', email: 'coach@kalos.demo', passwordHash, role: 'coach' });

console.log('Seed complete. All accounts use password: kalos123');
await mongoose.disconnect();
process.exit(0);
