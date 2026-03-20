import { getHistoryEvents, HistoryEventType } from "@/lib/history-data";
import { Clock, Heart, Activity, Plus, CreditCard, Wallet } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDateGroup(date: Date) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const d = new Date(date);
  d.setHours(0,0,0,0);
  
  const diff = today.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 3600 * 24));
  
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function getEventIcon(type: HistoryEventType) {
  switch (type) {
    case 'DECISION_CREATED': return <Plus size={16} className="text-blue-500" />;
    case 'HEARTBEAT': return <Heart size={16} className="text-pink-500" />;
    case 'BEHAVIOR': return <Activity size={16} className="text-indigo-500" />;
    case 'SUBSCRIPTION_CREATED': return <CreditCard size={16} className="text-purple-500" />;
    case 'EXPENSE_RECORD': return <Wallet size={16} className="text-orange-500" />;
  }
}

function getEventLink(type: HistoryEventType, relatedId?: string) {
  if (!relatedId) return "#";
  switch (type) {
    case 'DECISION_CREATED':
    case 'HEARTBEAT':
    case 'BEHAVIOR':
      return `/decision/${relatedId}`;
    case 'SUBSCRIPTION_CREATED':
      return `/subscription/${relatedId}`;
    case 'EXPENSE_RECORD':
      return `/expense/${relatedId}`;
  }
}

export default async function HistoryPage() {
  const events = await getHistoryEvents();

  // Group events by date
  const groupedEvents: Record<string, typeof events> = {};
  events.forEach(event => {
    const key = formatDateGroup(event.date);
    if (!groupedEvents[key]) groupedEvents[key] = [];
    groupedEvents[key].push(event);
  });

  const groups = Object.keys(groupedEvents);

  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-1 text-gray-700">
          <Clock size={24} />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">历史记录</h1>
        </div>
        <p className="text-gray-400 text-xs md:text-sm truncate">
          回顾你的所有决策历程。
        </p>
      </header>

      <div className="max-w-3xl">
        {events.length === 0 ? (
          <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p>暂无历史记录</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(group => (
              <div key={group} className="relative">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 sticky top-20 bg-gray-50/95 backdrop-blur-sm py-2 z-10 w-fit px-2 rounded-lg">
                  {group}
                </h3>
                <div className="space-y-4 pl-4 border-l-2 border-gray-100 ml-2">
                  {groupedEvents[group].map(event => (
                    <Link 
                      key={event.id} 
                      href={getEventLink(event.type, event.relatedId)}
                      className="block group"
                    >
                      <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-200 flex items-center justify-between">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-200 group-hover:border-blue-400 transition-colors flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                            {getEventIcon(event.type)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 line-clamp-1">{event.title}</div>
                            {event.subtitle && (
                              <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">{event.subtitle}</div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-4">
                          {event.amount !== undefined && (
                            <div className="font-bold text-gray-900">
                              ¥{event.amount.toLocaleString()}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
