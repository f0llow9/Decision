import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function getDecisions() {
  noStore();
  try {
    const decisions = await prisma.decision.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return decisions;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch decisions.");
  }
}

export async function getSubscriptions() {
  noStore();
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return subscriptions;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch subscriptions.");
  }
}

export async function getExpenses() {
  noStore();
  try {
    // Fetch categories with their latest record
    const expenses = await prisma.expenseCategory.findMany({
      include: {
        records: {
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return expenses;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch expenses.");
  }
}
