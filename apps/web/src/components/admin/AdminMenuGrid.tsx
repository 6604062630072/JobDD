'use client';

import { ReactNode } from 'react';

interface AdminMenuItem {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

interface AdminMenuGridProps {
  items: AdminMenuItem[];
}

export function AdminMenuGrid({ items }: AdminMenuGridProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">เมนูการจัดการ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          if (item.disabled || item.comingSoon) {
            return (
              <div
                key={item.id}
                className="p-4 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.comingSoon ? 'เร็วๆ นี้' : item.description}</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <a
              key={item.id}
              href={item.href || '#'}
              className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors text-blue-600">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
