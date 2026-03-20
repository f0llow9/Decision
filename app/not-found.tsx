import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="text-9xl font-bold text-gray-100">404</div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">页面未找到</h2>
        <p className="text-gray-500">
          抱歉，我们找不到您要访问的页面。
        </p>
      </div>
      <Link 
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-blue-200 shadow-lg"
      >
        <ArrowLeft size={18} />
        <span>返回首页</span>
      </Link>
    </div>
  );
}
