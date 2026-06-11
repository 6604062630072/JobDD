'use client';

import { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  bgColor: string;
  trend?: number;
  subtitle?: string;
}

export function DashboardStatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  trend,
  subtitle,
}: DashboardStatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`${bgColor} rounded-xl p-3 ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
            <TrendingUp className="w-3 h-3" />
            +{trend}%
          </div>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">
        {typeof value === 'number' ? value.toLocaleString('th-TH') : value}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );
}
