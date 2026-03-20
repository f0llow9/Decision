import { Plus } from "lucide-react";

export function EmptyCard() {
  return (
    <div className="bg-gray-50/50 rounded-3xl p-6 border-2 border-dashed border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group flex flex-col items-center justify-center h-full min-h-[200px] cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Plus size={24} className="text-gray-400 group-hover:text-blue-500" />
      </div>
      <p className="text-sm font-medium text-gray-400 group-hover:text-blue-600">等待输入...</p>
    </div>
  );
}
