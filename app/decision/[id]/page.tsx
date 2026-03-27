import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DecisionForm } from "@/components/decision/DecisionForm";
import { InteractionSection } from "@/components/decision/InteractionSection";
import { DeleteButton } from "@/components/common/DeleteButton";
import { DecisionInput } from "@/lib/algorithm";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const dynamicParams = true;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DecisionDetailPage({ params }: PageProps) {
  // In newer Next.js versions, awaiting params can prevent certain hydration/routing bugs
  const id = params?.id;

  if (!id) {
    console.error("No ID provided in params");
    notFound();
  }

  const decision = await prisma.decision.findUnique({
    where: { id },
  });

  if (!decision) {
    console.error(`Decision not found for ID: ${id}`);
    notFound();
  }

  const isDraft = decision.price === 0;

  // Transform Prisma data to Form Input shape
  const initialData: DecisionInput & { name: string } = {
    name: decision.name,
    price: decision.price,
    usageDuration: decision.usageDuration as any,
    usageFrequency: decision.usageFrequency as any,
    certaintyLevel: decision.certaintyLevel as any,
    consumptionType: decision.consumptionType as any,
    hasAlternative: decision.hasAlternative,
    alternativeCostLevel: decision.alternativeCostLevel as any,
    nonPurchaseImpact: decision.nonPurchaseImpact as any,
    affectedPeopleCount: decision.affectedPeopleCount as any,
    desireDuration: decision.desireDuration as any,
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <header className="mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
          <span>决策详情</span>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{decision.name}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{decision.name}</h1>
      </header>

      {isDraft ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
            <p className="text-sm text-blue-800">
              这是一个新的决策草稿。请回答以下 10 个问题，算法将为你评估是否值得购买。
            </p>
          </div>
          <DecisionForm id={decision.id} initialData={initialData} />
          
          <div className="pt-8 border-t border-gray-100 flex justify-center">
            <DeleteButton id={decision.id} type="decision" label="删除草稿" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Result Dashboard */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">当前评分</div>
            <div className="text-6xl font-bold text-gray-900 mb-4 tabular-nums">{decision.score}</div>
            <div className="inline-block px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
              {decision.status === "RECOMMENDED" && "推荐购买"}
              {decision.status === "WAIT" && "建议暂缓"}
              {decision.status === "NOT_RECOMMENDED" && "不建议购买"}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-50">
              <div>
                <div className="text-xs text-gray-400 mb-1">使用价值 (UV)</div>
                <div className="text-xl font-bold text-gray-800">{decision.uvScore}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">替代压力 (SP)</div>
                <div className="text-xl font-bold text-gray-800">{decision.spScore}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">价格压力 (PP)</div>
                <div className="text-xl font-bold text-gray-800">{decision.ppScore}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">持续需求 (PS)</div>
                <div className="text-xl font-bold text-gray-800">{decision.psScore}</div>
              </div>
            </div>
          </div>

          {/* Interaction Section */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">打卡互动</h2>
            <InteractionSection 
              decisionId={decision.id} 
              heartbeatCount={decision.heartbeatCount} 
              behaviorTotalAmount={decision.behaviorTotalAmount} 
            />
          </section>

          {/* Re-evaluation Form */}
          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">重新评估</h2>
            <DecisionForm id={decision.id} initialData={initialData} />
          </section>

          <div className="pt-8 border-t border-gray-100 flex justify-center">
            <DeleteButton id={decision.id} type="decision" label="删除决策" />
          </div>
        </div>
      )}
    </div>
  );
}
