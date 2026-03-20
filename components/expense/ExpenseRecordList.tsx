"use client";

import { useState, useTransition } from "react";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createExpenseRecordAction } from "@/lib/actions";

interface ExpenseRecord {
  id: string;
  amount: number;
  date: Date;
  note: string | null;
}

interface ExpenseRecordListProps {
  categoryId: string;
  records: ExpenseRecord[];
}

export function ExpenseRecordList({ categoryId, records }: ExpenseRecordListProps) {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    startTransition(async () => {
      const result = await createExpenseRecordAction(categoryId, parseFloat(amount), note, date);
      if (result.success) {
        setAmount("");
        setNote("");
        setDate(new Date().toISOString().split("T")[0]);
        setIsAdding(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">支出记录</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus size={16} />
          <span>记一笔</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">金额</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">备注 (选填)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="例如：机票、酒店..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isPending || !amount}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isPending && <Loader2 className="animate-spin" size={12} />}
              确认添加
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">暂无支出记录</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">¥{record.amount.toLocaleString()}</div>
                {record.note && <div className="text-xs text-gray-500 mt-0.5">{record.note}</div>}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                <Calendar size={12} />
                <span>{new Date(record.date).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
