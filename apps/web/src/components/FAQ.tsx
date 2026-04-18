'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function FAQ() {
  const t = useTranslations('FAQ');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: t('questions.q1'),
      answer: t('questions.a1'),
    },
    {
      question: t('questions.q2'),
      answer: t('questions.a2'),
    },
    {
      question: t('questions.q3'),
      answer: t('questions.a3'),
    },
    {
      question: t('questions.q4'),
      answer: t('questions.a4'),
    },
    {
      question: t('questions.q5'),
      answer: t('questions.a5'),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-2xl mb-4">
            <MessageCircleQuestion className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-red-200 shadow-lg shadow-red-100/50'
                    : 'border-gray-100 hover:border-red-100 hover:shadow-md'
                }`}
              >
                <button
                  className="w-full px-6 py-5 text-left flex justify-between  items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset group"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-semibold text-[1.1rem] transition-colors duration-300 pr-8 ${
                      isOpen ? 'text-red-700' : 'text-gray-800'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isOpen ? 'bg-red-50' : 'bg-gray-50 group-hover:bg-red-50'
                    }`}
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isOpen
                          ? 'rotate-180 text-red-600'
                          : 'text-gray-400 group-hover:text-red-500'
                      }`}
                    />
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 pt-1 text-gray-600 leading-relaxed border-t border-gray-50 mt-2">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            {t('stillHaveQuestions')}{' '}
            <Link
              href="/contact-us"
              className="text-red-600 font-semibold hover:underline decoration-2 underline-offset-4"
            >
              {t('contactUs')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
