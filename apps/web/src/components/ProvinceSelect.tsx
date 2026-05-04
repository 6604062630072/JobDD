'use client';

import { useState, useEffect } from 'react';
import { SearchableSelect } from './SearchableSelect';
import { X } from 'lucide-react'; // หรือไอคอนที่มีในโปรเจกต์

const DATA_URL = 'https://cdn.jsdelivr.net/gh/earthchie/jquery.Thailand.js@master/jquery.Thailand.js/database/raw_database/raw_database.json';

interface Props {
    selectedProvinces: string[]; // รับค่าจากฟอร์มหลัก
    onChange: (provinces: string[]) => void; // ส่งค่ากลับไปฟอร์มหลัก
}

export function ProvinceSelect({ selectedProvinces, onChange }: Props) {
    const [provinces, setProvinces] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(DATA_URL)
            .then((r) => r.json())
            .then((json: any[]) => {
                const uniqueProvinces = [...new Set(json.map((d: any) => d.province))].sort((a: any, b: any) =>
                    a.localeCompare(b, 'th')
                );
                setProvinces(uniqueProvinces);
            })
            .catch(err => console.error("Fetch error:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSelect = (province: string) => {
        // ป้องกันการเลือกซ้ำ
        if (province && !selectedProvinces.includes(province)) {
            onChange([...selectedProvinces, province]);
        }
    };

    const handleRemove = (provinceToRemove: string) => {
        onChange(selectedProvinces.filter(p => p !== provinceToRemove));
    };

    return (
        <div className="space-y-3">
            <SearchableSelect
                placeholder={loading ? 'กำลังโหลด...' : 'พิมพ์ชื่อจังหวัดเพื่อค้นหา...'}
                value=""
                onChange={handleSelect}
                options={provinces
                    .filter(p => !selectedProvinces.includes(p)) // กรองจังหวัดที่เลือกไปแล้วออก
                    .map((p) => ({ value: p, label: p }))
                }
            />

            {/* ส่วนแสดงผลจังหวัดที่เลือกแล้ว (Badges) */}
            <div className="flex flex-wrap gap-2">
                {selectedProvinces.map((p) => (
                    <span
                        key={p}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                        {p}
                        <button
                            type="button"
                            onClick={() => handleRemove(p)}
                            className="hover:text-blue-900"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
                {selectedProvinces.length === 0 && !loading && (
                    <span className="text-gray-400 text-sm">ยังไม่ได้เลือกจังหวัด (สามารถเลือกได้หลายจังหวัด)</span>
                )}
            </div>
        </div>
    );
}