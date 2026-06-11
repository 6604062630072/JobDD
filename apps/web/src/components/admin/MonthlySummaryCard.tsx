'use client';

import { CheckCircle2 } from 'lucide-react';

interface MonthlySummaryItem {
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface MonthlySummaryCardProps {
  items: MonthlySummaryItem[];
}

export function MonthlySummaryCard({ items }: MonthlySummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        สรุปรายเดือน
      </h2>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className={`p-4 ${item.bgColor} rounded-xl border ${item.borderColor}`}>
            <p className="text-xs text-gray-500 font-medium">{item.label}</p>
            <p className={`text-2xl font-bold ${item.textColor} mt-1`}>+{item.value}</p>
            <p className="text-xs text-gray-400 mt-1">เดือนนี้</p>
          </div>
        ))}
      </div>
    </div>
  );
}
