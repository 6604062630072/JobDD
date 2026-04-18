'use client';

import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2, Camera } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { useTranslations } from 'next-intl';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const MAX_IMAGES = 5;

interface CompanyImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function CompanyImageUpload({ images, onChange }: CompanyImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('jobcreate.basicInfo');

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`อัพโหลดได้สูงสุด ${MAX_IMAGES} รูปเท่านั้น`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(
        `เลือกไว้ ${files.length} รูป แต่เหลือ slot ว่าง ${remaining} — อัพโหลดแค่ ${remaining} รูปแรก`,
      );
    }

    setUploading(true);
    const token = localStorage.getItem('accessToken');
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'อัพโหลดไม่สำเร็จ');
        }

        const data = await res.json();
        newUrls.push(data.url);
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัพโหลด'));
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
    setUploading(false);

    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <Camera className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          {t('companyImages.title')}
        </label>
        <span className="text-xs text-gray-400 font-medium">
          {images.length}/{MAX_IMAGES} {t('companyImages.pic')}
        </span>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-5 gap-3">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-300 transition-all cursor-pointer shadow-sm"
            onClick={() => setLightboxIndex(idx)}
          >
            <img src={url} alt={`รูปบริษัท ${idx + 1}`} className="w-full h-full object-cover" />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium transition-opacity">
                {t('companyImages.pic')}
              </span>
            </div>
            {/* Delete button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(idx);
              }}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md hover:scale-110"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Upload button slot */}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{t('companyImages.addBtn')}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Error message */}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {/* Help text */}
      <p className="text-xs text-gray-400">{t('companyImages.hint')}</p>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
