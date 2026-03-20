import { getSubscriptions } from "@/lib/data";
import { SubscriptionCard } from "@/components/cards/SubscriptionCard";
import { CreateBar } from "@/components/dashboard/CreateBar";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();

  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-1 text-indigo-600">
          <CreditCard size={24} />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">订阅管理</h1>
        </div>
        <p className="text-gray-400 text-xs md:text-sm truncate">
          追踪周期性支出，避免不必要的自动扣费。
        </p>
      </header>

      {/* Quick Create */}
      <section className="sticky top-0 z-20 pt-0 pb-4 -mx-4 px-4 md:-mx-8 md:px-8 bg-gray-50/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm !mt-0">
        <CreateBar defaultType="subscription" hideTypeSelector />
      </section>

      {/* List */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="h-full">
              <SubscriptionCard
                id={sub.id}
                name={sub.name}
                price={sub.price}
                billingCycle={sub.billingCycle as any}
                nextBillingDate={new Date(sub.nextBillingDate).toLocaleDateString()}
              />
            </div>
          ))}
          
          {subscriptions.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p>暂无订阅记录，试着添加一个？</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
