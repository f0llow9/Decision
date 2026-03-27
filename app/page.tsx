import { Suspense } from "react";
import { CardBoard } from "@/components/dashboard/CardBoard";
import { CreateBar } from "@/components/dashboard/CreateBar";
import { getDecisions, getSubscriptions, getExpenses } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Home() {
  const [decisions, subscriptions, expenses] = await Promise.all([
    getDecisions(),
    getSubscriptions(),
    getExpenses(),
  ]);

  return (
    <div className="space-y-12">
      {/* Create Section */}
      <section className="sticky top-0 z-20 pt-0 pb-4 -mt-4 -mx-4 px-4 md:-mt-8 md:-mx-8 md:px-8 bg-gray-50/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <CreateBar />
      </section>

      {/* Dashboard Grid */}
      <section>
        <CardBoard 
          decisions={decisions} 
          subscriptions={subscriptions}
          // Prisma query returns object with records[], CardBoard expects simplified Expense
          expenses={expenses.map(e => ({
            id: e.id,
            name: e.name,
            records: e.records
          }))} 
        />
      </section>
    </div>
  );
}
