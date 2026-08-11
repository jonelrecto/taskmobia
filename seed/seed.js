const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Seed demo user ─────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where:  { email: 'admin@projectflow.io' },
    update: {},
    create: {
      name:     'Admin User',
      email:    'admin@projectflow.io',
      password: hashedPassword,
    },
  });
  console.log('👤 Demo user created: admin@projectflow.io / password123');

  const dataPath = path.join(__dirname, '..', 'test_data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const projects = JSON.parse(rawData);

  // Clear existing projects
  await prisma.project.deleteMany();
  console.log('🧹 Existing projects cleared.');

  // Seed projects
  for (const project of projects) {
    await prisma.project.create({
      data: {
        id: project.id,
        clientName: project.clientName,
        projectName: project.projectName,
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        dueDate: project.dueDate,
      },
    });
  }

  console.log(`✅ Successfully seeded ${projects.length} projects!`);
}

main()
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
