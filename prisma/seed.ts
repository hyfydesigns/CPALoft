import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo CPA user
  const hashedPassword = await bcrypt.hash("demo1234", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@cpaloft.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "demo@cpaloft.com",
      password: hashedPassword,
      role: "cpa",
      plan: "pro",
      firm: "Johnson & Associates CPA",
      phone: "(555) 123-4567",
      licenseNumber: "CPA-2019-TX-48291",
      emailVerified: new Date(),
    },
  });

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: "client-1" },
      update: {},
      create: {
        id: "client-1",
        name: "Acme Corporation",
        email: "finance@acme.com",
        phone: "(555) 987-6543",
        company: "Acme Corporation",
        taxId: "12-3456789",
        status: "active",
        userId: demoUser.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "client-2" },
      update: {},
      create: {
        id: "client-2",
        name: "Robert Martinez",
        email: "robert.m@email.com",
        phone: "(555) 234-5678",
        company: "Martinez LLC",
        taxId: "98-7654321",
        status: "active",
        userId: demoUser.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "client-3" },
      update: {},
      create: {
        id: "client-3",
        name: "TechStart Inc",
        email: "cfo@techstart.io",
        phone: "(555) 345-6789",
        company: "TechStart Inc",
        taxId: "55-1234567",
        status: "active",
        userId: demoUser.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "client-4" },
      update: {},
      create: {
        id: "client-4",
        name: "Emily Chen",
        email: "emily.chen@personal.com",
        phone: "(555) 456-7890",
        status: "pending",
        userId: demoUser.id,
      },
    }),
  ]);

  // Create a sample chat
  const chat = await prisma.chat.create({
    data: {
      title: "Tax Depreciation Question",
      userId: demoUser.id,
      messages: {
        create: [
          {
            role: "user",
            content:
              "What is the Section 179 deduction limit for 2024 and how does bonus depreciation work?",
          },
          {
            role: "assistant",
            content:
              "Great question! Here's a breakdown of Section 179 and bonus depreciation for 2024:\n\n**Section 179 Deduction (2024)**\n- **Deduction limit:** $1,220,000\n- **Phase-out threshold:** $3,050,000 (dollar-for-dollar reduction above this amount)\n- Applies to tangible personal property and certain real property improvements\n\n**Bonus Depreciation (2024)**\n- **Rate:** 60% (phasing down from 100% in 2022)\n- Applies to qualified property placed in service during the year\n- Unlike Section 179, bonus depreciation can create or increase a net operating loss\n\n**Key Differences:**\n| Feature | Section 179 | Bonus Depreciation |\n|---------|-------------|--------------------|\n| Limit | $1.22M | No dollar limit |\n| NOL | Cannot create | Can create/increase |\n| Property | Business use only | Qualified property |\n\nWould you like me to help calculate the optimal combination for a specific client situation?",
          },
        ],
      },
    },
  });

  console.log("✅ Seed completed successfully");
  console.log(`   Demo user: demo@cpaloft.com / demo1234`);
  console.log(`   Created ${clients.length} sample clients`);
  console.log(`   Created 1 sample chat`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
