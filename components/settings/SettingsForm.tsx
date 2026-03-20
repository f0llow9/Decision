"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { resetAllDataAction } from "@/lib/actions";
import { Loader2, Trash2, User, Globe, AlertTriangle } from "lucide-react";

export function SettingsForm() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, startResetTransition] = useTransition();

  const handleReset = () => {
    startResetTransition(async () => {
      const result = await resetAllDataAction();
      if (result.success) {
        toast.success(result.message);
        setShowResetDialog(false);
        // Refresh page to clear data from view
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 1. User Profile */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
          <User className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900">用户信息</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
            <input
              type="text"
              defaultValue="User"
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              defaultValue="user@example.com"
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
            />
          </div>
        </div>
      </section>

      {/* 2. Preferences */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
          <Globe className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900">偏好设置</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">货币单位</label>
            <select className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none">
              <option value="CNY">人民币 (CNY)</option>
              <option value="USD">美元 (USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">时区</label>
            <select className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none appearance-none">
              <option value="Asia/Shanghai">Asia/Shanghai (GMT+8)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Danger Zone */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-50">
          <AlertTriangle className="text-red-600" size={20} />
          <h2 className="text-lg font-bold text-red-600">危险操作</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
            <div>
              <h3 className="font-semibold text-gray-900">清空所有数据</h3>
              <p className="text-sm text-gray-500 mt-1">
                将删除所有决策、订阅和支出记录，此操作无法撤销。
              </p>
            </div>
            <button
              onClick={() => setShowResetDialog(true)}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-colors shadow-sm"
            >
              清空数据
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="清空所有数据"
        description="确定要清空所有数据吗？包括所有的决策记录、打卡记录、订阅和支出信息。此操作无法撤销。"
        onConfirm={handleReset}
        confirmText={isResetting ? "清空中..." : "确认清空"}
        isDestructive
      />
    </div>
  );
}
