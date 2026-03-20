import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SubscriptionForm } from "@/components/subscription/SubscriptionForm";
import { DeleteButton } from "@/components/common/DeleteButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: params.id },
  });

  if (!subscription) {
    notFound();
  }

  // Cast billingCycle enum to string for props
  const subData = {
    ...subscription,
    billingCycle: subscription.billingCycle as string,
    nextBillingDate: subscription.nextBillingDate.toISOString(),
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <header className="mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
          <span>订阅管理</span>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{subscription.name}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{subscription.name}</h1>
      </header>

      <SubscriptionForm subscription={subData} />
      
      <div className="pt-8 border-t border-gray-100 flex justify-center">
        <DeleteButton id={subscription.id} type="subscription" label="删除订阅" />
      </div>
    </div>
  );
}
