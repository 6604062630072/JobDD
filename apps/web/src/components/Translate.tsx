'use client';

import { useTranslator } from '@/hooks/useTranslator';
import { Loader2 } from 'lucide-react';

interface TranslateProps {
  text: string;
  className?: string;
  sourceLang?: string; // default 'th'
}

export function Translate({ text, className, sourceLang = 'th' }: TranslateProps) {
  const { translatedText, loading, error } = useTranslator({ text, sourceLang });

  if (loading) {
    return (
      <span className={`inline-flex items-center gap-1 opacity-70 ${className}`}>
        {text} <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
      </span>
    );
  }

  if (error) {
    // Show original text if translation fails
    return <span className={className}>{text}</span>;
  }

  return <span className={className} title={text !== translatedText ? `Original: ${text}` : undefined}>{translatedText}</span>;
}
