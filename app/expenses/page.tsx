import { getExpenses } from "@/lib/data";
import { ExpenseCard } from "@/components/cards/ExpenseCard";
import { CreateBar } from "@/components/dashboard/CreateBar";
import { Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-1 text-orange-600">
          <Wallet size={24} />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">大额支出</h1>
        </div>
        <p className="text-gray-400 text-xs md:text-sm truncate">
          记录非周期性的大额开销，控制预算。
        </p>
      </header>

      {/* Quick Create */}
      <section className="sticky top-0 z-20 pt-0 pb-4 -mx-4 px-4 md:-mx-8 md:px-8 bg-gray-50/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm !mt-0">
        <CreateBar defaultType="expense" hideTypeSelector />
      </section>

      {/* List */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expenses.map((expense) => {
            const latestRecord = expense.records[0];
            return (
              <div key={expense.id} className="h-full">
                <ExpenseCard
                  id={expense.id}
                  name={expense.name}
                  latestAmount={latestRecord?.amount || 0}
                  latestDate={latestRecord ? new Date(latestRecord.date).toLocaleDateString() : "无记录"}
                  note={latestRecord?.note || undefined}
                />
              </div>
            );
          })}
          
          {expenses.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p>暂无支出记录，试着添加一个？</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
