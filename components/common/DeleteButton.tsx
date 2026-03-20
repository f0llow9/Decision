"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteDecisionAction, deleteSubscriptionAction, deleteExpenseCategoryAction } from "@/lib/actions";
import { toast } from "sonner";

interface DeleteButtonProps {
  id: string;
  type: "decision" | "subscription" | "expense";
  label?: string;
}

export function DeleteButton({ id, type, label = "删除" }: DeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      let result;
      switch (type) {
        case "decision":
          result = await deleteDecisionAction(id);
          break;
        case "subscription":
          result = await deleteSubscriptionAction(id);
          break;
        case "expense":
          result = await deleteExpenseCategoryAction(id);
          break;
      }

      if (result?.success) {
        toast.success(result.message);
        router.push("/");
      } else {
        toast.error(result?.message || "删除失败");
      }
    });
  };

  const getDialogDescription = () => {
    switch (type) {
      case "decision": return "确定要删除这个决策吗？所有的打卡记录也将一并删除。";
      case "subscription": return "确定要删除这个订阅吗？此操作无法撤销。";
      case "expense": return "确定要删除这个支出分类吗？所有的历史记录也将一并删除。";
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors text-sm font-medium py-2 px-4 rounded-xl hover:bg-red-50"
      >
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        <span>{label}</span>
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`删除${label}`}
        description={getDialogDescription()}
        onConfirm={handleDelete}
        confirmText={isDeleting ? "删除中..." : "确认删除"}
        isDestructive
      />
    </>
  );
}
