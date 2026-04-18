'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function CookieConsent() {
  const t = useTranslations('CookieConsent');
  const [showConsent, setShowConsent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage after component mounts (client-side only)
    const hasConsented = localStorage.getItem('jobSabuy_cookie_consent');
    if (!hasConsented) {
      setShowConsent(true);
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const logConsentToDb = async (consent: boolean) => {
    try {
      const token = localStorage.getItem('token'); // Typical token key
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/cookie-consent`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ consent }),
      });
    } catch (error) {
      console.error('Failed to log cookie consent', error);
    }
  };

  const acceptCookie = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowConsent(false);
      localStorage.setItem('jobSabuy_cookie_consent', 'true');
      logConsentToDb(true);
    }, 300); // Wait for transition out
  };

  const declineCookie = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowConsent(false);
      // You can handle declining cookies differently if needed
      localStorage.setItem('jobSabuy_cookie_consent', 'false');
      logConsentToDb(false);
    }, 300);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] w-[calc(100%-2rem)] md:w-[400px] p-5 md:p-6 bg-white border border-gray-100 rounded-2xl shadow-xl transition-all duration-500 ease-out flex flex-col gap-4 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{t('title')}</h3>
        <button
          onClick={declineCookie}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-label="Close cookie consent"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {t('description')}{' '}
        <Link
          href="/privacy-policy"
          className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors inline-block"
        >
          {t('policyLink')}
        </Link>
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={declineCookie}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
        >
          {t('decline')}
        </button>
        <button
          onClick={acceptCookie}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all shadow-sm"
        >
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
