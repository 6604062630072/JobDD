'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ComingSoonPage() {
  const t = useTranslations('comingSoon'); 

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-6 bg-blue-50 rounded-full text-blue-600">
            <Construction size={64} strokeWidth={1.5} />
          </div>
        </div>

        {/* title*/}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white-900">
            {t('title')}
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Home */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={18} />
            {t('backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
