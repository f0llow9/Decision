"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { DecisionInput, UsageDuration, UsageFrequency, CertaintyLevel, ConsumptionType, AlternativeCostLevel, NonPurchaseImpact, AffectedPeopleCount, DesireDuration } from "@/lib/algorithm";
import { updateDecisionAction } from "@/lib/actions";

interface DecisionFormProps {
  id: string;
  initialData: DecisionInput & { name: string };
}

export function DecisionForm({ id, initialData }: DecisionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<DecisionInput>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: keyof DecisionInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.price <= 0) {
      toast.error("价格必须大于 0");
      return;
    }

    startTransition(async () => {
      const result = await updateDecisionAction(id, formData);
      if (result.success) {
        toast.success(result.message);
        setTimeout(() => router.push("/"), 800);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Helper for consistent Select UI
  const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
      </div>
    </div>
  );

  const selectClass = "w-full p-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto pb-20">
      
      {/* 1. Basic Info */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">基础信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品价格 (¥)</label>
            <input
              type="number"
              value={formData.price || ""}
              onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
              placeholder="请输入价格"
              min="0"
            />
          </div>
        </div>
      </section>

      {/* 2. Usage Value (UV) */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">使用价值评估</h2>
        <div className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">预计使用多久？</label>
              <SelectWrapper>
                <select
                  value={formData.usageDuration}
                  onChange={(e) => handleChange("usageDuration", e.target.value)}
                  className={selectClass}
                >
                  <option value="one_time">一次性 / 很快不用</option>
                  <option value="less_than_3m">少于 3 个月</option>
                  <option value="three_to_twelve_m">3 - 12 个月</option>
                  <option value="one_to_three_y">1 - 3 年</option>
                  <option value="more_than_three_y">3 年以上</option>
                </select>
              </SelectWrapper>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">使用频率如何？</label>
              <SelectWrapper>
                <select
                  value={formData.usageFrequency}
                  onChange={(e) => handleChange("usageFrequency", e.target.value)}
                  className={selectClass}
                >
                  <option value="rarely">很少使用</option>
                  <option value="monthly">每月几次</option>
                  <option value="weekly">每周使用</option>
                  <option value="several_per_week">每周多次</option>
                  <option value="daily">几乎每天</option>
                </select>
              </SelectWrapper>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">确定会持续使用吗？</label>
              <SelectWrapper>
                <select
                  value={formData.certaintyLevel}
                  onChange={(e) => handleChange("certaintyLevel", e.target.value)}
                  className={selectClass}
                >
                  <option value="very_uncertain">很不确定</option>
                  <option value="somewhat_uncertain">有点不确定</option>
                  <option value="neutral">一般</option>
                  <option value="somewhat_certain">比较确定</option>
                  <option value="very_certain">非常确定</option>
                </select>
              </SelectWrapper>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">消费类型</label>
              <SelectWrapper>
                <select
                  value={formData.consumptionType}
                  onChange={(e) => handleChange("consumptionType", e.target.value)}
                  className={selectClass}
                >
                  <option value="luxury">纯享受 / 冲动消费</option>
                  <option value="improvement">体验提升型</option>
                  <option value="productivity">生产力工具</option>
                  <option value="health_safety">健康 / 安全相关</option>
                  <option value="essential">刚需</option>
                </select>
              </SelectWrapper>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Substitute Pressure (SP) */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">替代方案分析</h2>
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">有没有可接受的替代方案？</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleChange("hasAlternative", true)}
                className={`flex-1 py-3 rounded-xl border transition-all ${formData.hasAlternative ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                有替代方案
              </button>
              <button
                type="button"
                onClick={() => handleChange("hasAlternative", false)}
                className={`flex-1 py-3 rounded-xl border transition-all ${!formData.hasAlternative ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                没有替代方案
              </button>
            </div>
          </div>

          {formData.hasAlternative && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用替代方案有多麻烦？</label>
              <SelectWrapper>
                <select
                  value={formData.alternativeCostLevel}
                  onChange={(e) => handleChange("alternativeCostLevel", e.target.value)}
                  className={selectClass}
                >
                  <option value="none">几乎没代价</option>
                  <option value="low">有点麻烦</option>
                  <option value="medium">比较麻烦</option>
                  <option value="high">非常麻烦</option>
                </select>
              </SelectWrapper>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">不买会有多大影响？</label>
              <SelectWrapper>
                <select
                  value={formData.nonPurchaseImpact}
                  onChange={(e) => handleChange("nonPurchaseImpact", e.target.value)}
                  className={selectClass}
                >
                  <option value="almost_none">几乎没影响</option>
                  <option value="minor">有一点影响</option>
                  <option value="moderate">有明显不便</option>
                  <option value="major">影响很大</option>
                </select>
              </SelectWrapper>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">这事影响几个人？</label>
              <SelectWrapper>
                <select
                  value={formData.affectedPeopleCount}
                  onChange={(e) => handleChange("affectedPeopleCount", e.target.value)}
                  className={selectClass}
                >
                  <option value="self_only">只影响我自己</option>
                  <option value="two_people">2 个人</option>
                  <option value="family_small">3-4 个人</option>
                  <option value="family_large">5 人及以上</option>
                </select>
              </SelectWrapper>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Psychological (PS) */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">心理需求</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">想买这东西多久了？</label>
          <SelectWrapper>
            <select
              value={formData.desireDuration}
              onChange={(e) => handleChange("desireDuration", e.target.value)}
              className={selectClass}
            >
              <option value="less_than_3d">不到 3 天</option>
              <option value="three_to_seven_d">3 - 7 天</option>
              <option value="one_to_four_w">1 - 4 周</option>
              <option value="one_to_three_m">1 - 3 个月</option>
              <option value="more_than_three_m">3 个月以上</option>
            </select>
          </SelectWrapper>
        </div>
      </section>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-center md:static md:bg-transparent md:border-none md:p-0">
        <button
          type="submit"
          disabled={isPending || formData.price <= 0}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Save size={20} />
              <span>保存并计算评分</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
}
