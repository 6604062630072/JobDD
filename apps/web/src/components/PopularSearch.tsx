import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function PopularSearch() {
  const t = useTranslations('PopularSearch');
  
  const searches = [
    { label: t('terms.manager'), value: 'Manager เงินเดือนสูง' },
    { label: t('terms.it'), value: 'IT เงินเดือน 50K' },
    { label: t('terms.ecommerce'), value: 'E-Commerce' },
    { label: t('terms.data'), value: 'Data Analyst' },
    { label: t('terms.digital'), value: 'Digital Marketing' },
    { label: t('terms.accounting'), value: 'บัญชีและการเงิน' },
  ];

  return (
    <section className="py-8 bg-white">
      <div className="max-w-(--container-max) mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-black uppercase">{t('title')}</h2>
        <div className="flex flex-wrap gap-3">
          {searches.map((term, index) => (
            <Link
              key={index}
              href={`/jobs?q=${encodeURIComponent(term.value)}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {term.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
