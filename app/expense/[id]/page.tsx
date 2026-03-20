import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ExpenseRecordList } from "@/components/expense/ExpenseRecordList";
import { DeleteButton } from "@/components/common/DeleteButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  const expense = await prisma.expenseCategory.findUnique({
    where: { id: params.id },
    include: {
      records: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!expense) {
    notFound();
  }

  // Calculate total amount
  const totalAmount = expense.records.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <header className="mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
          <span>大额支出</span>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{expense.name}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{expense.name}</h1>
      </header>

      {/* Summary Card */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center mb-8">
        <div className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">累计支出</div>
        <div className="text-5xl font-bold text-gray-900 tabular-nums">¥{totalAmount.toLocaleString()}</div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">
            {expense.records.length} 笔记录
          </span>
        </div>
      </div>

      {/* Records List & Add Form */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <ExpenseRecordList categoryId={expense.id} records={expense.records} />
      </div>

      <div className="pt-8 mt-8 border-t border-gray-100 flex justify-center">
        <DeleteButton id={expense.id} type="expense" label="删除分类" />
      </div>
    </div>
  );
}
