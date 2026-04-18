import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function AISkillBanner() {
  const t = useTranslations('AISkillBanner');

  return (
    <section className="py-16 bg-white overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Image */}
        <div className="relative w-full max-w-5xl mx-auto aspect-21/10 rounded-3xl overflow-hidden shadow-2xl shadow-[#020263]/10 mb-10 border border-gray-100">
          <Image
            src="/images/Ai_JobDD.png"
            alt="AI วิเคราะห์ทักษะ"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
            className="object-cover"
            priority
          />
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-[#020263]/30 via-transparent to-transparent" />
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href="/ai-job-matcher"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-[#020263]/25 hover:shadow-xl hover:shadow-[#020263]/30 hover:-translate-y-1 transition-all duration-300"
            style={{ backgroundColor: '#020263' }}
          >
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            {t('cta')}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
