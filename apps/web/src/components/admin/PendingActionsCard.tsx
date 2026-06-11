'use client';

import { Clock, Building2, AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface PendingAction {
  id: string;
  title: string;
  description: string;
  count: number;
  icon: ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
  actionLabel: string;
  actionHref: string;
}

interface PendingActionsCardProps {
  actions: PendingAction[];
  totalPending: number;
}

export function PendingActionsCard({ actions, totalPending }: PendingActionsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          รายการรอดำเนินการ
        </h2>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
          {totalPending}
        </span>
      </div>

      <div className="space-y-3">
        {actions.length > 0 ? (
          actions.map((action) => (
            <div
              key={action.id}
              className={`flex items-center justify-between p-4 ${action.bgColor} rounded-xl border ${action.borderColor} hover:border-opacity-100 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                  {action.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${action.textColor}`}>{action.count}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">ไม่มีรายการรอดำเนินการ</p>
          </div>
        )}

        {/* Quick Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 pt-2">
            {actions.map((action) => (
              <a
                key={`action-${action.id}`}
                href={action.actionHref}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-center text-sm"
              >
                {action.actionLabel}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
