"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Calendar, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { updateSubscriptionAction } from "@/lib/actions";

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  nextBillingDate: string; // ISO string
  autoRenew: boolean;
  note: string | null;
}

interface SubscriptionFormProps {
  subscription: Subscription;
}

export function SubscriptionForm({ subscription }: SubscriptionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: subscription.name,
    price: subscription.price,
    billingCycle: subscription.billingCycle,
    nextBillingDate: new Date(subscription.nextBillingDate).toISOString().split("T")[0],
    autoRenew: subscription.autoRenew,
    note: subscription.note || "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    startTransition(async () => {
      const result = await updateSubscriptionAction(subscription.id, {
        ...formData,
        nextBillingDate: new Date(formData.nextBillingDate),
      });

      if (result.success) {
        toast.success(result.message);
        setTimeout(() => router.push("/"), 800);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto pb-20">
      
      {/* Main Info Card */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">订阅信息</h2>
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">服务名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="例如：Netflix"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格 (¥)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">扣费周期</label>
              <div className="relative">
                <select
                  value={formData.billingCycle}
                  onChange={(e) => handleChange("billingCycle", e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="MONTHLY">每月 (Monthly)</option>
                  <option value="QUARTERLY">每季 (Quarterly)</option>
                  <option value="YEARLY">每年 (Yearly)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <RefreshCcw size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">下次扣费日期</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.nextBillingDate}
                  onChange={(e) => handleChange("nextBillingDate", e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 bg-white pl-2">
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <span className="text-sm font-medium text-gray-700">自动续费</span>
              <button
                type="button"
                role="switch"
                aria-checked={formData.autoRenew}
                onClick={() => handleChange("autoRenew", !formData.autoRenew)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  formData.autoRenew ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.autoRenew ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all h-24 resize-none"
              placeholder="写点什么..."
            />
          </div>

        </div>
      </section>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-center md:static md:bg-transparent md:border-none md:p-0">
        <button
          type="submit"
          disabled={isPending || !formData.name}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-12 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Save size={20} />
              <span>保存订阅</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
}
