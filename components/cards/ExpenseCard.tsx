"use client";

import { Clock, Wallet, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteExpenseCategoryAction } from "@/lib/actions";
import { toast } from "sonner";

interface ExpenseCardProps {
  id: string;
  name: string; // Category Name
  latestAmount: number;
  latestDate: string; // formatted date
  note?: string;
}

export function ExpenseCard({ id, name, latestAmount, latestDate, note }: ExpenseCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteExpenseCategoryAction(id);
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
        <Link href={`/expense/${id}`} className="block h-full">
          <div className="bg-white rounded-3xl p-6 pl-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-100 hover:-translate-y-1 transition-all duration-200 flex flex-col h-full min-h-[160px] relative overflow-hidden">
            {/* Status Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500" />
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 tabular-nums">¥{latestAmount.toLocaleString()}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">最近支出</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">
              {name}
            </h3>
            
            {note && (
              <div className="text-sm text-gray-500 mb-4 line-clamp-1">
                {note}
              </div>
            )}

            <div className="mt-auto flex items-center gap-2 pt-4 border-t border-gray-50 text-gray-500 text-xs font-medium">
              <Clock size={14} className="text-orange-400" />
              <span>{latestDate}</span>
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
          title="删除支出"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="删除支出分类"
        description={`确定要删除“${name}”吗？所有的历史记录也将一并删除。`}
        onConfirm={handleDelete}
        confirmText={isDeleting ? "删除中..." : "确认删除"}
        isDestructive
      />
    </>
  );
}
