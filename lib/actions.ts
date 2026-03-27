"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateScore, DecisionInput } from "@/lib/algorithm";

// ... existing actions ...

export async function createDecisionAction(name: string): Promise<{success: boolean; message: string; id?: string}> {
  if (!name.trim()) return { success: false, message: "名称不能为空" };

  try {
    const decision = await prisma.decision.create({
      data: {
        name,
        // MVP Defaults
        price: 0, // 0 indicates DRAFT
        score: 50,
        status: "WAIT",
        uvScore: 0,
        spScore: 0,
        ppScore: 0,
        psScore: 0,
        
        // Required fields with defaults
        usageDuration: "one_to_three_y",
        usageFrequency: "daily",
        certaintyLevel: "neutral",
        consumptionType: "essential",
        hasAlternative: false,
        alternativeCostLevel: "none",
        nonPurchaseImpact: "minor",
        affectedPeopleCount: "self_only",
        desireDuration: "one_to_four_w",
      },
    });
    revalidatePath("/");
    return { success: true, message: "决策草稿创建成功", id: decision.id };
  } catch (error) {
    console.error("Failed to create decision:", error);
    return { success: false, message: "创建失败，请重试" };
  }
}

export async function createSubscriptionAction(name: string): Promise<{success: boolean; message: string; id?: string}> {
  if (!name.trim()) return { success: false, message: "名称不能为空" };

  try {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        name,
        // MVP Defaults
        price: 0,
        billingCycle: "MONTHLY",
        nextBillingDate: nextMonth,
        usageFrequency: "WEEKLY",
        autoRenew: true,
      },
    });
    revalidatePath("/");
    return { success: true, message: "订阅草稿创建成功", id: subscription.id };
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return { success: false, message: "创建失败，请重试" };
  }
}

export async function createExpenseCategoryAction(name: string): Promise<{success: boolean; message: string; id?: string}> {
  if (!name.trim()) return { success: false, message: "名称不能为空" };

  try {
    const category = await prisma.expenseCategory.create({
      data: {
        name,
        // No records initially
      },
    });
    revalidatePath("/");
    return { success: true, message: "支出分类创建成功", id: category.id };
  } catch (error) {
    console.error("Failed to create expense category:", error);
    return { success: false, message: "创建失败，请重试" };
  }
}

export async function updateDecisionAction(id: string, formData: DecisionInput) {
  try {
    // 1. Fetch current heartbeat/behavior stats to preserve/use them
    const current = await prisma.decision.findUnique({
      where: { id },
      select: { heartbeatCount: true, behaviorTotalAmount: true }
    });

    if (!current) return { success: false, message: "Decision not found" };

    // 2. Calculate new score
    const result = calculateScore(formData, current.heartbeatCount, current.behaviorTotalAmount);

    // 3. Update database
    await prisma.decision.update({
      where: { id },
      data: {
        price: formData.price,
        usageDuration: formData.usageDuration,
        usageFrequency: formData.usageFrequency,
        certaintyLevel: formData.certaintyLevel,
        consumptionType: formData.consumptionType,
        hasAlternative: formData.hasAlternative,
        alternativeCostLevel: formData.alternativeCostLevel,
        nonPurchaseImpact: formData.nonPurchaseImpact,
        affectedPeopleCount: formData.affectedPeopleCount,
        desireDuration: formData.desireDuration,
        
        // Calculated fields
        score: result.score,
        status: result.status,
        uvScore: result.uvScore,
        spScore: result.spScore,
        ppScore: result.ppScore,
        psScore: result.psScore,
      }
    });

    revalidatePath("/");
    revalidatePath(`/decision/${id}`);
    return { success: true, message: "保存成功" };
  } catch (error) {
    console.error("Failed to update decision:", error);
    return { success: false, message: "更新失败，请重试" };
  }
}

// ----------------------------------------------------------------------
// DELETE ACTIONS
// ----------------------------------------------------------------------

export async function deleteDecisionAction(id: string) {
  try {
    await prisma.decision.delete({ where: { id } });
    revalidatePath("/");
    return { success: true, message: "删除成功" };
  } catch (error) {
    console.error("Failed to delete decision:", error);
    return { success: false, message: "删除失败" };
  }
}

export async function deleteSubscriptionAction(id: string) {
  try {
    await prisma.subscription.delete({ where: { id } });
    revalidatePath("/");
    return { success: true, message: "删除成功" };
  } catch (error) {
    console.error("Failed to delete subscription:", error);
    return { success: false, message: "删除失败" };
  }
}

export async function deleteExpenseCategoryAction(id: string) {
  try {
    await prisma.expenseCategory.delete({ where: { id } });
    revalidatePath("/");
    return { success: true, message: "删除成功" };
  } catch (error) {
    console.error("Failed to delete expense category:", error);
    return { success: false, message: "删除失败" };
  }
}

// ----------------------------------------------------------------------
// DANGER ACTIONS (Settings)
// ----------------------------------------------------------------------

export async function resetAllDataAction() {
  try {
    // Delete in order to respect foreign keys (cascades handle most, but to be safe)
    // Actually cascades on Decision/ExpenseCategory handle children.
    await prisma.heartbeatRecord.deleteMany({});
    await prisma.behaviorRecord.deleteMany({});
    await prisma.expenseRecord.deleteMany({});
    
    await prisma.decision.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.expenseCategory.deleteMany({});
    
    revalidatePath("/");
    return { success: true, message: "所有数据已清空" };
  } catch (error) {
    console.error("Failed to reset data:", error);
    return { success: false, message: "操作失败" };
  }
}

// For MVP, delete account is same as reset data
export async function deleteAccountAction() {
  return resetAllDataAction();
}

// ----------------------------------------------------------------------
// INTERACTION ACTIONS
// ----------------------------------------------------------------------

// Helper to recalculate score after interaction
async function recalculateDecisionScore(
  decisionId: string, 
  currentHeartbeatCount: number, 
  currentBehaviorTotal: number
) {
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId }
  });

  if (!decision) return;

  const input: DecisionInput = {
    price: decision.price,
    usageDuration: decision.usageDuration as any,
    usageFrequency: decision.usageFrequency as any,
    certaintyLevel: decision.certaintyLevel as any,
    consumptionType: decision.consumptionType as any,
    hasAlternative: decision.hasAlternative,
    alternativeCostLevel: decision.alternativeCostLevel as any,
    nonPurchaseImpact: decision.nonPurchaseImpact as any,
    affectedPeopleCount: decision.affectedPeopleCount as any,
    desireDuration: decision.desireDuration as any,
  };

  // Pass the FRESH counts to calculation
  const result = calculateScore(input, currentHeartbeatCount, currentBehaviorTotal);

  await prisma.decision.update({
    where: { id: decisionId },
    data: {
      score: result.score,
      status: result.status,
      uvScore: result.uvScore,
      spScore: result.spScore,
      ppScore: result.ppScore,
      psScore: result.psScore,
    }
  });
}

export async function addHeartbeatAction(decisionId: string) {
  try {
    // 1. Determine today's date (normalized to midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Try to create heartbeat record
    try {
      await prisma.heartbeatRecord.create({
        data: {
          decisionId,
          recordedOn: today,
        }
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        return { success: false, message: "今天已经打过卡了" };
      }
      throw e;
    }

    // 3. Update aggregate count on Decision
    const count = await prisma.heartbeatRecord.count({
      where: { decisionId }
    });

    await prisma.decision.update({
      where: { id: decisionId },
      data: { heartbeatCount: count }
    });

    // 4. Recalculate Score with FRESH count
    // NOTE: passing the just-fetched count is crucial
    const decision = await prisma.decision.findUnique({ where: { id: decisionId }, select: { behaviorTotalAmount: true } });
    await recalculateDecisionScore(decisionId, count, decision?.behaviorTotalAmount || 0);

    revalidatePath(`/decision/${decisionId}`);
    revalidatePath("/");
    return { success: true, message: "心动已记录 (+1.5分)" };
  } catch (error) {
    console.error("Failed to add heartbeat:", error);
    return { success: false, message: "打卡失败" };
  }
}

export async function addBehaviorAction(decisionId: string, amount: number, note?: string) {
  if (amount <= 0) return { success: false, message: "金额必须大于 0" };

  try {
    // 1. Create behavior record
    await prisma.behaviorRecord.create({
      data: {
        decisionId,
        amount,
        note,
      }
    });

    // 2. Update aggregate sum on Decision
    const aggregations = await prisma.behaviorRecord.aggregate({
      where: { decisionId },
      _sum: { amount: true }
    });
    
    const totalAmount = aggregations._sum.amount || 0;

    await prisma.decision.update({
      where: { id: decisionId },
      data: { behaviorTotalAmount: totalAmount }
    });

    // 3. Recalculate Score with FRESH total
    const decision = await prisma.decision.findUnique({ where: { id: decisionId }, select: { heartbeatCount: true } });
    await recalculateDecisionScore(decisionId, decision?.heartbeatCount || 0, totalAmount);

    revalidatePath(`/decision/${decisionId}`);
    revalidatePath("/");
    return { success: true, message: "记录成功" };
  } catch (error) {
    console.error("Failed to add behavior:", error);
    return { success: false, message: "记录失败" };
  }
}

// ----------------------------------------------------------------------
// EXPENSE ACTIONS
// ----------------------------------------------------------------------

export async function createExpenseRecordAction(categoryId: string, amount: number, note: string, dateStr: string) {
  if (amount <= 0) return { success: false, message: "金额必须大于 0" };
  if (!dateStr) return { success: false, message: "请选择日期" };

  try {
    await prisma.expenseRecord.create({
      data: {
        categoryId,
        amount,
        note,
        date: new Date(dateStr),
      }
    });

    // Update Category updatedAt to bubble up to top of list if we wanted sorting by recency
    await prisma.expenseCategory.update({
      where: { id: categoryId },
      data: { updatedAt: new Date() }
    });

    revalidatePath(`/expense/${categoryId}`);
    revalidatePath("/");
    return { success: true, message: "记录成功" };
  } catch (error) {
    console.error("Failed to add expense record:", error);
    return { success: false, message: "记录失败" };
  }
}

// ----------------------------------------------------------------------
// SUBSCRIPTION ACTIONS
// ----------------------------------------------------------------------

interface SubscriptionData {
  name: string;
  price: number;
  billingCycle: string;
  nextBillingDate: Date;
  autoRenew: boolean;
  note?: string;
}

export async function updateSubscriptionAction(id: string, data: SubscriptionData) {
  if (!data.name.trim()) return { success: false, message: "名称不能为空" };
  if (data.price < 0) return { success: false, message: "价格不能为负" };

  try {
    await prisma.subscription.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        billingCycle: data.billingCycle,
        nextBillingDate: data.nextBillingDate,
        autoRenew: data.autoRenew,
        note: data.note,
      }
    });

    revalidatePath(`/subscription/${id}`);
    revalidatePath("/");
    return { success: true, message: "保存成功" };
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return { success: false, message: "更新失败" };
  }
}
