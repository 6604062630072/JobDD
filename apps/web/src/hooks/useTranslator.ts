import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

interface UseTranslatorProps {
  text: string;
  sourceLang?: string; // default 'th'
}

export function useTranslator({ text, sourceLang = 'th' }: UseTranslatorProps) {
  const locale = useLocale();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If text is empty or target locale is same as source, no need to translate
    if (!text || locale === sourceLang) {
      setTranslatedText(text);
      return;
    }

    // Check if we have cached translation (optional, but good for performance)
    const cacheKey = `trans_${sourceLang}_${locale}_${text}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    const translate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: locale }),
        });

        if (!res.ok) throw new Error('Translation failed');

        const data = await res.json();
        setTranslatedText(data.translatedText);
        sessionStorage.setItem(cacheKey, data.translatedText);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        // Fallback to original text on error
        setTranslatedText(text);
      } finally {
        setLoading(false);
      }
    };

    // Debounce or just call it? 
    // For now, call it directly. Ideally should debounce if text changes rapidly.
    const timer = setTimeout(translate, 100); 
    return () => clearTimeout(timer);

  }, [text, locale, sourceLang]);

  return { translatedText, loading, error };
}
