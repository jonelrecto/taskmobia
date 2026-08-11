const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();

// Fix for Vercel Serverless environment:
// Vercel serverless functions run in a read-only filesystem except for /tmp.
// We copy the bundled SQLite database (dev.db) into /tmp/dev.db on boot.
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const tmpDbPath = '/tmp/dev.db';

  if (!fs.existsSync(tmpDbPath)) {
    const candidates = [
      path.join(process.cwd(), 'prisma/dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.join(__dirname, '../../prisma/dev.db'),
      path.join(__dirname, '../prisma/dev.db'),
    ];

    for (const src of candidates) {
      if (fs.existsSync(src)) {
        try {
          fs.copyFileSync(src, tmpDbPath);
          console.log(`[DB] Copied SQLite database from ${src} to ${tmpDbPath}`);
          break;
        } catch (err) {
          console.error(`[DB] Failed to copy SQLite file from ${src}:`, err.message);
        }
      }
    }
  }

  process.env.DATABASE_URL = `file:${tmpDbPath}`;
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'projectflow-jwt-secret-dev-change-in-prod';
}

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  prisma = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  prisma = global.__db__;
}

module.exports = prisma;
