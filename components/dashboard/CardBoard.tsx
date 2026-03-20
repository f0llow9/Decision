import { DecisionCard, DecisionStatus } from "@/components/cards/DecisionCard";
import { SubscriptionCard, BillingCycle } from "@/components/cards/SubscriptionCard";
import { ExpenseCard } from "@/components/cards/ExpenseCard";
import { EmptyCard } from "@/components/cards/EmptyCard";

interface Decision {
  id: string;
  name: string;
  score: number;
  status: string; // Will cast to DecisionStatus
  price: number;
  heartbeatCount: number;
  behaviorTotalAmount: number;
  updatedAt: Date;
}

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: string; // Will cast to BillingCycle
  nextBillingDate: Date;
}

interface Expense {
  id: string;
  name: string;
  records: {
    amount: number;
    date: Date;
    note: string | null;
  }[];
}

interface CardBoardProps {
  decisions: Decision[];
  subscriptions: Subscription[];
  expenses: Expense[];
}

export function CardBoard({ decisions, subscriptions, expenses }: CardBoardProps) {
  // Helper to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      {/* Decisions */}
      {decisions.map((decision) => (
        <DecisionCard 
          key={decision.id}
          id={decision.id}
          name={decision.name}
          score={decision.score}
          status={decision.status as DecisionStatus}
          price={decision.price}
          heartbeatCount={decision.heartbeatCount}
          behaviorTotal={decision.behaviorTotalAmount}
          updatedAt={formatDate(decision.updatedAt)}
        />
      ))}

      {/* Subscriptions */}
      {subscriptions.map((sub) => (
        <SubscriptionCard 
          key={sub.id}
          id={sub.id}
          name={sub.name}
          price={sub.price}
          billingCycle={sub.billingCycle as BillingCycle}
          nextBillingDate={formatDate(sub.nextBillingDate)}
        />
      ))}

      {/* Expenses */}
      {expenses.map((expense) => {
        const latestRecord = expense.records[0];
        return (
          <ExpenseCard 
            key={expense.id}
            id={expense.id}
            name={expense.name}
            latestAmount={latestRecord?.amount ?? 0}
            latestDate={latestRecord ? formatDate(latestRecord.date) : "无记录"}
            note={latestRecord?.note ?? undefined}
          />
        );
      })}

      {/* Empty States */}
      {decisions.length === 0 && subscriptions.length === 0 && expenses.length === 0 && (
        <>
          <EmptyCard />
          <EmptyCard />
        </>
      )}
      
      {/* Always show at least one empty card for creating new things if list is short */}
      {(decisions.length + subscriptions.length + expenses.length) < 8 && <EmptyCard />}
    </div>
  );
}
