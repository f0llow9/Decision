"use client";

import { useState, useTransition } from "react";
import { Plus, CheckSquare, Repeat, Wallet, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createDecisionAction, createSubscriptionAction, createExpenseCategoryAction } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CARD_TYPES = [
  {
    id: "decision",
    title: "决策",
    description: "记录并分析你的购买冲动，避免冲动消费。",
    icon: CheckSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    hoverBorder: "hover:border-blue-500",
    action: createDecisionAction,
    defaultName: "新决策",
    routePrefix: "/decision",
  },
  {
    id: "subscription",
    title: "订阅",
    description: "管理你的周期性扣费服务，及时取消不必要的订阅。",
    icon: Repeat,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    hoverBorder: "hover:border-purple-500",
    action: createSubscriptionAction,
    defaultName: "新订阅",
    routePrefix: "/subscription",
  },
  {
    id: "expense",
    title: "大额支出",
    description: "追踪你的重大消费记录，掌控预算流向。",
    icon: Wallet,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    hoverBorder: "hover:border-rose-500",
    action: createExpenseCategoryAction,
    defaultName: "新支出分类",
    routePrefix: "/expense",
  },
];

export function EmptyCard() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handleCreate = (type: typeof CARD_TYPES[0]) => {
    setLoadingType(type.id);
    startTransition(async () => {
      try {
        const result = await type.action(type.defaultName);
        if (result?.success && result.id) {
          toast.success("创建成功，请补充详情");
          setIsOpen(false);
          router.push(`${type.routePrefix}/${result.id}`);
        } else {
          toast.error(result?.message || "创建失败");
        }
      } catch (error) {
        toast.error("创建失败");
      } finally {
        setLoadingType(null);
      }
    });
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-gray-50/50 rounded-3xl p-6 border-2 border-dashed border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group flex flex-col items-center justify-center h-full min-h-[200px] cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Plus size={24} className="text-gray-400 group-hover:text-blue-500" />
        </div>
        <p className="text-sm font-medium text-gray-400 group-hover:text-blue-600">添加新卡片</p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">选择卡片类型</DialogTitle>
            <DialogDescription>
              你想创建哪种类型的消费管理卡片？
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 mt-4">
            {CARD_TYPES.map((type) => {
              const Icon = type.icon;
              const isLoading = loadingType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleCreate(type)}
                  disabled={isPending}
                  className={cn(
                    "flex items-start text-left p-4 rounded-2xl border-2 border-transparent bg-gray-50 transition-all duration-200 focus:outline-none",
                    !isPending && `hover:bg-white hover:shadow-md ${type.hoverBorder}`,
                    isPending && !isLoading && "opacity-50 cursor-not-allowed",
                    isLoading && "opacity-80"
                  )}
                >
                  <div className={cn("p-3 rounded-xl mr-4", type.bgColor, type.color)}>
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{type.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
