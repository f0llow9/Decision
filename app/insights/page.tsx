import { getDecisions, getSubscriptions, getExpenses } from "@/lib/data";
import { LineChart, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const decisions = await getDecisions();
  const subscriptions = await getSubscriptions();
  const expenses = await getExpenses();

  // 1. 本月新增决策数
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newDecisionsCount = decisions.filter(d => {
    const date = new Date(d.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  // 2. 当前订阅数量
  const activeSubscriptionsCount = subscriptions.length;

  // 3. 每月订阅总费用
  const monthlySubscriptionCost = subscriptions.reduce((sum, s) => {
    let monthlyPrice = s.price;
    if (s.billingCycle === "QUARTERLY") monthlyPrice = s.price / 3;
    if (s.billingCycle === "YEARLY") monthlyPrice = s.price / 12;
    return sum + monthlyPrice;
  }, 0);

  // 4. 最近一次大额支出
  const allRecords = expenses.flatMap(cat => 
    cat.records.map(r => ({
      amount: r.amount,
      date: r.date,
      name: cat.name
    }))
  );

  allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const latestExpense = allRecords.length > 0 ? allRecords[0] : null;

  const getDaysAgo = (date: Date) => {
    const diff = new Date().getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    return `${days} 天前`;
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-1 text-purple-600">
          <LineChart size={24} />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">数据洞察</h1>
        </div>
        <p className="text-gray-400 text-xs md:text-sm truncate">
          分析你的消费习惯，发现省钱机会。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="p-2 bg-blue-50 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <span className="font-medium text-sm text-gray-500">本月新增决策</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{newDecisionsCount}</div>
            <div className="text-xs text-gray-400 mt-1">个决策项</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <TrendingDown size={20} />
            </div>
            <span className="font-medium text-sm text-gray-500">订阅服务</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{activeSubscriptionsCount}</div>
            <div className="text-xs text-gray-400 mt-1">个活跃订阅</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex items-center gap-3 text-pink-600">
            <div className="p-2 bg-pink-50 rounded-xl">
              <Wallet size={20} />
            </div>
            <span className="font-medium text-sm text-gray-500">每月订阅支出</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">¥{Math.round(monthlySubscriptionCost).toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">预估月固定支出</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex items-center gap-3 text-orange-600">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Wallet size={20} />
            </div>
            <span className="font-medium text-sm text-gray-500">最近大额支出</span>
          </div>
          <div>
            {latestExpense ? (
              <>
                <div className="text-3xl font-bold text-gray-900">¥{latestExpense.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1 flex justify-between">
                  <span>{latestExpense.name}</span>
                  <span>{getDaysAgo(latestExpense.date)}</span>
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-sm mt-2">暂无记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
