import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export type HistoryEventType = 
  | 'DECISION_CREATED' 
  | 'HEARTBEAT' 
  | 'BEHAVIOR' 
  | 'SUBSCRIPTION_CREATED' 
  | 'EXPENSE_RECORD';

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  date: Date;
  title: string;
  subtitle?: string;
  amount?: number;
  relatedId?: string;
}

export async function getHistoryEvents(): Promise<HistoryEvent[]> {
  noStore();
  const events: HistoryEvent[] = [];

  // 1. Decisions Created
  const decisions = await prisma.decision.findMany({
    select: { id: true, name: true, createdAt: true, price: true }
  });
  decisions.forEach(d => {
    events.push({
      id: `decision-${d.id}`,
      type: 'DECISION_CREATED',
      date: d.createdAt,
      title: `创建决策：${d.name}`,
      subtitle: d.price > 0 ? `预算 ¥${d.price}` : '草稿',
      relatedId: d.id
    });
  });

  // 2. Heartbeat Records
  const heartbeats = await prisma.heartbeatRecord.findMany({
    include: { decision: { select: { name: true } } }
  });
  heartbeats.forEach(h => {
    events.push({
      id: `heartbeat-${h.id}`,
      type: 'HEARTBEAT',
      date: h.createdAt, // Use createdAt for precise time
      title: `心动打卡：${h.decision.name}`,
      relatedId: h.decisionId
    });
  });

  // 3. Behavior Records
  const behaviors = await prisma.behaviorRecord.findMany({
    include: { decision: { select: { name: true } } }
  });
  behaviors.forEach(b => {
    events.push({
      id: `behavior-${b.id}`,
      type: 'BEHAVIOR',
      date: b.createdAt,
      title: `行为记录：${b.decision.name}`,
      subtitle: b.note || undefined,
      amount: b.amount,
      relatedId: b.decisionId
    });
  });

  // 4. Subscriptions Created
  const subscriptions = await prisma.subscription.findMany({
    select: { id: true, name: true, createdAt: true, price: true, billingCycle: true }
  });
  subscriptions.forEach(s => {
    events.push({
      id: `sub-${s.id}`,
      type: 'SUBSCRIPTION_CREATED',
      date: s.createdAt,
      title: `新增订阅：${s.name}`,
      subtitle: `${s.billingCycle} ¥${s.price}`,
      amount: s.price,
      relatedId: s.id
    });
  });

  // 5. Expense Records
  const expenses = await prisma.expenseRecord.findMany({
    include: { category: { select: { name: true, id: true } } }
  });
  expenses.forEach(e => {
    events.push({
      id: `expense-${e.id}`,
      type: 'EXPENSE_RECORD',
      date: e.date, // Use selected date
      title: `新增支出：${e.category.name}`,
      subtitle: e.note || undefined,
      amount: e.amount,
      relatedId: e.categoryId
    });
  });

  // Sort by date desc
  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}
