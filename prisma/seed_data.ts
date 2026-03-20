// seed_data.ts
// Demo seed data for Decision MVP
// Aligned with Prisma Schema camelCase fields
// Modified for SQLite (Enums -> Strings)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Clear existing data
  await prisma.expenseRecord.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.heartbeatRecord.deleteMany();
  await prisma.behaviorRecord.deleteMany();
  await prisma.decision.deleteMany();

  // ---------- DECISIONS ----------
  const decision1 = await prisma.decision.create({
    data: {
      name: "Buy Sony WH‑1000XM5 Headphones",
      note: "Need noise cancelling for office",
      price: 2499,
      score: 72,
      status: "RECOMMENDED",
      uvScore: 25,
      spScore: 18,
      ppScore: 6,
      psScore: 35,
      heartbeatCount: 2,
      behaviorTotalAmount: 50,
      
      // Questionnaire
      usageDuration: "one_to_three_y",
      usageFrequency: "daily",
      certaintyLevel: "somewhat_certain",
      consumptionType: "productivity",
      hasAlternative: true,
      alternativeCostLevel: "medium",
      nonPurchaseImpact: "moderate",
      affectedPeopleCount: "self_only",
      desireDuration: "one_to_four_w",

      heartbeats: {
        create: [
          { recordedOn: new Date("2024-03-01") },
          { recordedOn: new Date("2024-03-05") }
        ]
      },
      behaviors: {
        create: [
          {
            amount: 50,
            note: "Bought coffee instead",
            createdAt: new Date("2024-03-02")
          }
        ]
      }
    }
  });

  const decision2 = await prisma.decision.create({
    data: {
      name: "Upgrade to MacBook Pro M3",
      price: 18999,
      score: 58,
      status: "WAIT",
      uvScore: 28,
      spScore: 15,
      ppScore: 20,
      psScore: 35,
      heartbeatCount: 0,
      behaviorTotalAmount: 0,

      // Questionnaire
      usageDuration: "more_than_three_y",
      usageFrequency: "daily",
      certaintyLevel: "very_certain",
      consumptionType: "productivity",
      hasAlternative: false,
      alternativeCostLevel: "high",
      nonPurchaseImpact: "major",
      affectedPeopleCount: "self_only",
      desireDuration: "one_to_three_m",
    }
  });

  // ---------- SUBSCRIPTIONS ----------
  await prisma.subscription.createMany({
    data: [
      {
        name: "Spotify Premium",
        price: 15,
        billingCycle: "MONTHLY",
        nextBillingDate: new Date("2024-04-01"),
        usageFrequency: "DAILY",
        autoRenew: true
      },
      {
        name: "Netflix",
        price: 48,
        billingCycle: "MONTHLY",
        nextBillingDate: new Date("2024-03-25"),
        usageFrequency: "WEEKLY",
        autoRenew: true
      },
      {
        name: "ChatGPT Plus",
        price: 145,
        billingCycle: "MONTHLY",
        nextBillingDate: new Date("2024-03-20"),
        usageFrequency: "DAILY",
        autoRenew: true
      }
    ]
  });

  // ---------- EXPENSE CATEGORIES ----------
  const travelCategory = await prisma.expenseCategory.create({
    data: {
      name: "Travel",
      note: "Flights, hotels, trips",
      records: {
        create: [
          {
            amount: 3500,
            note: "Flight to Tokyo",
            date: new Date("2024-02-15")
          },
          {
            amount: 1200,
            note: "Hotel Booking",
            date: new Date("2024-02-18")
          }
        ]
      }
    }
  });

  const electronicsCategory = await prisma.expenseCategory.create({
    data: {
      name: "Electronics",
      note: "Devices and gadgets",
      records: {
        create: [
          {
            amount: 8999,
            note: "iPhone 15 Pro",
            date: new Date("2023-12-25")
          }
        ]
      }
    }
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
