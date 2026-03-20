"use client";

import { Heart, Activity, ArrowRight, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteDecisionAction } from "@/lib/actions";
import { toast } from "sonner";

export type DecisionStatus = "RECOMMENDED" | "WAIT" | "NOT_RECOMMENDED";

interface DecisionCardProps {
  id: string;
  name: string;
  score: number;
  status: DecisionStatus;
  price: number;
  heartbeatCount: number;
  behaviorTotal: number;
  updatedAt: string; // formatted date
}

const STATUS_CONFIG: Record<DecisionStatus, { label: string; color: string; bg: string }> = {
  RECOMMENDED: { label: "推荐购买", color: "text-green-600", bg: "bg-green-50" },
  WAIT: { label: "建议等待", color: "text-yellow-600", bg: "bg-yellow-50" },
  NOT_RECOMMENDED: { label: "不建议购买", color: "text-red-600", bg: "bg-red-50" },
};

export function DecisionCard({ id, name, score, status, price, heartbeatCount, behaviorTotal }: DecisionCardProps) {
  const isDraft = price === 0;
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDecisionAction(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Draft View
  if (isDraft) {
    return (
      <>
        <div className="relative group h-full">
          <Link href={`/decision/${id}`} className="block h-full">
            <div className="bg-white rounded-3xl p-6 pl-8 shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col h-full min-h-[200px] relative overflow-hidden">
              {/* Status Color Bar */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-300" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-500">
                  待完善
                </div>
                <div className="text-2xl font-bold text-gray-300 tabular-nums">
                  --
                  <span className="text-xs text-gray-300 font-normal ml-1">/ 100</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                {name}
              </h3>
              
              <div className="text-sm text-gray-400 mb-6 font-medium">
                暂无报价
              </div>

              <div className="mt-auto flex items-center justify-center pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:underline">
                  <Edit size={14} />
                  <span>去完善决策</span>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Delete Button (Visible on Hover) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowDelete(true);
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-gray-100"
            title="删除草稿"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <ConfirmDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          title="删除草稿"
          description={`确定要删除“${name}”吗？此操作无法撤销。`}
          onConfirm={handleDelete}
          confirmText={isDeleting ? "删除中..." : "确认删除"}
          isDestructive
        />
      </>
    );
  }

  // Normal View
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.WAIT;
  
  // Status Color Bar Config
  const statusColorBar = {
    RECOMMENDED: "bg-green-500",
    WAIT: "bg-yellow-500",
    NOT_RECOMMENDED: "bg-red-500",
  }[status] || "bg-yellow-500";

  return (
    <>
      <div className="relative group h-full">
        <Link href={`/decision/${id}`} className="block h-full">
          <div className="bg-white rounded-3xl p-6 pl-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 hover:-translate-y-1 transition-all duration-200 flex flex-col h-full min-h-[200px] relative overflow-hidden">
            {/* Status Color Bar */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-2", statusColorBar)} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={cn("px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide", statusConfig.bg, statusConfig.color)}>
                {statusConfig.label}
              </div>
              <div className="text-2xl font-bold text-gray-900 tabular-nums">
                {score}
                <span className="text-xs text-gray-400 font-normal ml-1">/ 100</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
              {name}
            </h3>
            
            <div className="text-sm text-gray-500 mb-6 font-medium">
              ¥{price.toLocaleString()}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-gray-500">
                <Heart size={14} className="text-pink-400" />
                <span className="text-xs font-medium">{heartbeatCount} 天心动</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Activity size={14} className="text-blue-400" />
                <span className="text-xs font-medium">替代 ¥{behaviorTotal}</span>
              </div>
            </div>

            {/* Hover Action Indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform group-hover:translate-x-1 duration-200">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <ArrowRight size={16} />
              </div>
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
          title="删除决策"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="删除决策"
        description={`确定要删除“${name}”吗？所有的打卡记录也将一并删除。`}
        onConfirm={handleDelete}
        confirmText={isDeleting ? "删除中..." : "确认删除"}
        isDestructive
      />
    </>
  );
}
