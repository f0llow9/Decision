import { SettingsForm } from "@/components/settings/SettingsForm";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-1 text-gray-700">
          <Settings size={24} />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">设置</h1>
        </div>
        <p className="text-gray-400 text-xs md:text-sm truncate">
          管理你的账户和偏好设置。
        </p>
      </header>

      <SettingsForm />
    </div>
  );
}
