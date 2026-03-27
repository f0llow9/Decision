"use client";

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createDecisionAction, createSubscriptionAction, createExpenseCategoryAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

const CREATE_TYPES = [
  { id: "decision", label: "新建决策", placeholder: "输入你正在考虑的消费决策（例如：升级 MacBook）" },
  { id: "subscription", label: "新建订阅", placeholder: "输入订阅名称（例如：Netflix）" },
  { id: "expense", label: "新建大额支出", placeholder: "输入支出类别（例如：年度旅游）" },
];

interface CreateBarProps {
  defaultType?: "decision" | "subscription" | "expense";
  hideTypeSelector?: boolean;
}

export function CreateBar({ defaultType = "decision", hideTypeSelector = false }: CreateBarProps) {
  const router = useRouter();
  const initialType = CREATE_TYPES.find(t => t.id === defaultType) || CREATE_TYPES[0];
  const [selectedType, setSelectedType] = useState(initialType);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    startTransition(async () => {
      let result: { success: boolean; message: string; id?: string } | undefined;
      try {
        switch (selectedType.id) {
          case "decision":
            result = await createDecisionAction(inputValue);
            break;
          case "subscription":
            result = await createSubscriptionAction(inputValue);
            break;
          case "expense":
            result = await createExpenseCategoryAction(inputValue);
            break;
        }

        if (result?.success) {
          setInputValue("");
          toast.success(result.message);
        } else {
          toast.error(result?.message || "创建失败");
        }
      } catch (error) {
        toast.error("创建失败");
      }
    });
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 transition-all duration-300",
      isFocused ? "shadow-md ring-2 ring-blue-50 border-blue-100 bg-white" : "hover:border-blue-100",
      isPending && "opacity-80 pointer-events-none"
    )}>
      {!hideTypeSelector && (
        <>
          {/* Mobile Tabs */}
          <div className="flex md:hidden bg-gray-50 rounded-xl p-1 mb-1">
            {CREATE_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "flex-1 py-2 text-xs font-medium rounded-lg transition-all",
                  selectedType.id === type.id 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {type.label.replace("新建", "")}
              </button>
            ))}
          </div>

          {/* Desktop Select */}
          <div className="hidden md:block relative group min-w-[140px]">
            <select 
              className="appearance-none w-full bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-700 font-medium font-sans py-3 pl-4 pr-10 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-50 transition-colors text-sm"
              value={selectedType.id}
              onChange={(e) => {
                const type = CREATE_TYPES.find(t => t.id === e.target.value) || CREATE_TYPES[0];
                setSelectedType(type);
              }}
              disabled={isPending}
            >
              {CREATE_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 w-full md:w-auto flex-1 items-center">
        <div className={cn("flex-1 relative w-full", hideTypeSelector && "pl-0 md:pl-4")}>
          <input
            type="text"
            placeholder={selectedType.placeholder}
            className="w-full py-3 px-4 text-gray-800 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 text-sm md:text-base"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isPending && inputValue.trim()) {
                handleSubmit();
              }
            }}
            disabled={isPending}
          />
        </div>

        <button 
          className={cn(
            "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-blue-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] md:min-w-[100px]",
            isPending && "cursor-not-allowed active:scale-100"
          )}
          disabled={!inputValue.trim() || isPending}
          onClick={handleSubmit}
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <span className="hidden md:inline">确认</span>
              <Check size={18} strokeWidth={3} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
