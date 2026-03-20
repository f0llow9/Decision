"use client";

import { CreditCard, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteSubscriptionAction } from "@/lib/actions";
import { toast } from "sonner";

export type BillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY";

interface SubscriptionCardProps {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  nextBillingDate: string; // formatted date
}

const CYCLE_CONFIG: Record<BillingCycle, string> = {
  MONTHLY: "月付",
  QUARTERLY: "季付",
  YEARLY: "年付",
};

export function SubscriptionCard({ id, name, price, billingCycle, nextBillingDate }: SubscriptionCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSubscriptionAction(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <div className="relative group h-full">
        <Link href={`/subscription/${id}`} className="block h-full">
          <div className="bg-white rounded-3xl p-6 pl-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1 transition-all duration-200 flex flex-col h-full min-h-[160px] relative overflow-hidden">
            {/* Status Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500" />

            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 tabular-nums">¥{price.toLocaleString()}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{CYCLE_CONFIG[billingCycle]}</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">
              {name}
            </h3>

            <div className="mt-auto flex items-center gap-2 pt-4 border-t border-gray-50 text-gray-500 text-xs font-medium">
              <Calendar size={14} className="text-indigo-400" />
              <span>下次扣费: {nextBillingDate}</span>
            </div>
          </div>
        </Link>

        {/* Delete Button (Visible on Hover) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowDelete(true);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-gray-100 z-10"
          title="删除订阅"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="删除订阅"
        description={`确定要删除“${name}”吗？此操作无法撤销。`}
        onConfirm={handleDelete}
        confirmText={isDeleting ? "删除中..." : "确认删除"}
        isDestructive
      />
    </>
  );
}
