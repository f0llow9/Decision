"use client";

import { useState, useTransition } from "react";
import { Heart, Activity, Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addHeartbeatAction, addBehaviorAction } from "@/lib/actions";

interface InteractionSectionProps {
  decisionId: string;
  heartbeatCount: number;
  behaviorTotalAmount: number;
}

export function InteractionSection({ decisionId, heartbeatCount, behaviorTotalAmount }: InteractionSectionProps) {
  const [isHeartbeatPending, startHeartbeatTransition] = useTransition();
  const [isBehaviorPending, startBehaviorTransition] = useTransition();
  
  // Behavior Form State
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showBehaviorForm, setShowBehaviorForm] = useState(false);

  const handleHeartbeat = () => {
    startHeartbeatTransition(async () => {
      const result = await addHeartbeatAction(decisionId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleBehaviorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    startBehaviorTransition(async () => {
      const result = await addBehaviorAction(decisionId, val, note);
      if (result.success) {
        setAmount("");
        setNote("");
        setShowBehaviorForm(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Heartbeat Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-4">
          <Heart size={24} fill={heartbeatCount > 0 ? "currentColor" : "none"} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">动心打卡</h3>
        <p className="text-sm text-gray-500 mb-6">
          今天又想买了？打个卡记录一下冲动。<br/>
          当前累计：<span className="font-bold text-gray-900">{heartbeatCount} 天</span>
        </p>
        <button
          onClick={handleHeartbeat}
          disabled={isHeartbeatPending}
          className="mt-auto w-full py-3 px-4 bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isHeartbeatPending ? <Loader2 className="animate-spin" size={18} /> : "❤️ 依然心动 (+1.5分)"}
        </button>
      </div>

      {/* Behavior Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
          <Activity size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">行为打卡</h3>
        <p className="text-sm text-gray-500 mb-6">
          因为没买这个，买了别的替代品？<br/>
          当前累计替代：<span className="font-bold text-gray-900">¥{behaviorTotalAmount}</span>
        </p>
        
        {!showBehaviorForm ? (
          <button
            onClick={() => setShowBehaviorForm(true)}
            className="mt-auto w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            <span>记一笔替代消费</span>
          </button>
        ) : (
          <form onSubmit={handleBehaviorSubmit} className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <input
              type="number"
              placeholder="金额 (¥)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              autoFocus
              min="0.01"
              step="0.01"
              disabled={isBehaviorPending}
            />
            <input
              type="text"
              placeholder="备注 (选填)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              disabled={isBehaviorPending}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowBehaviorForm(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50"
                disabled={isBehaviorPending}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0 || isBehaviorPending}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isBehaviorPending ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                <span>确认</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
