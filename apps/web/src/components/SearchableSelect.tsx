'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'พิมพ์เพื่อค้นหา...',
  className = '',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = value
    ? options.filter((o) => o.label.toLowerCase().includes(value.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!open) setOpen(true);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 cursor-text pr-8"
      />
      <ChevronDown
        className={`absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400 italic">
              ไม่มีในรายการ (ระบบจะใช้ค่าที่คุณพิมพ์)
            </div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${opt.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}