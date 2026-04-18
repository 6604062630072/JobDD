'use client';

import { useState, useEffect } from 'react';
import { SearchableSelect } from './SearchableSelect';

interface ThaiAddress {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
}

interface ThaiAddressFieldsProps {
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  onChange: (fields: {
    province: string;
    district: string;
    subDistrict: string;
    postalCode: string;
  }) => void;
}

// CDN URL — ใช้ jsDelivr ซึ่ง serve ไฟล์จาก GitHub โดยตรง
const DATA_URL =
  'https://cdn.jsdelivr.net/gh/earthchie/jquery.Thailand.js@master/jquery.Thailand.js/database/raw_database/raw_database.json';

function unique(arr: string[]): string[] {
  return [...new Set(arr)].sort((a, b) => a.localeCompare(b, 'th'));
}

export function ThaiAddressFields({
  province,
  district,
  subDistrict,
  postalCode,
  onChange,
}: ThaiAddressFieldsProps) {
  const [data, setData] = useState<ThaiAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => r.json())
      .then((json: ThaiAddress[]) => setData(json))
      .catch(() => {
        /* silently fail — fallback inputs shown */
      })
      .finally(() => setLoading(false));
  }, []);

  const provinces = unique(data.map((d) => d.province));
  const amphoes = province
    ? unique(data.filter((d) => d.province === province).map((d) => d.amphoe))
    : [];
  const subDistricts =
    province && district
      ? unique(
          data
            .filter((d) => d.province === province && d.amphoe === district)
            .map((d) => d.district),
        )
      : [];
  const zipcodes =
    province && district
      ? [
          ...new Set(
            data
              .filter((d) => d.province === province && d.amphoe === district)
              .map((d) => String(d.zipcode)),
          ),
        ]
      : [];

  const handleProvince = (val: string) =>
    onChange({ province: val, district: '', subDistrict: '', postalCode: '' });

  const handleAmphoe = (val: string) => {
    // If we select an Amphoe, we can check if there's only one sub-district
    // or if all sub-districts in this Amphoe share the same postal code
    const amphoeData = data.filter((d) => d.province === province && d.amphoe === val);
    const uniqueZipcodes = [...new Set(amphoeData.map((d) => String(d.zipcode)))];

    // Auto-fill postal code if there's only one for the entire Amphoe
    const autoPostalCode = uniqueZipcodes.length === 1 ? uniqueZipcodes[0] : '';

    onChange({
      province,
      district: val,
      subDistrict: '',
      postalCode: autoPostalCode,
    });
  };

  const handleSubDistrict = (val: string) => {
    const found = data.find(
      (d) => d.province === province && d.amphoe === district && d.district === val,
    );
    onChange({
      province,
      district,
      subDistrict: val,
      postalCode: found ? String(found.zipcode) : postalCode,
    });
  };

  const handlePostalCode = (val: string) =>
    onChange({ province, district, subDistrict, postalCode: val });

  // Fallback: plain text inputs ถ้าโหลดข้อมูลไม่ได้
  if (!loading && data.length === 0) {
    const fields = [
      { key: 'province', label: 'จังหวัด', value: province },
      { key: 'district', label: 'เขต/อำเภอ', value: district },
      { key: 'subDistrict', label: 'แขวง/ตำบล', value: subDistrict },
      { key: 'postalCode', label: 'รหัสไปรษณีย์', value: postalCode },
    ] as const;
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {fields.map(({ key, label, value }) => (
          <div key={key}>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) =>
                onChange({
                  province,
                  district,
                  subDistrict,
                  postalCode,
                  [key]: e.target.value,
                })
              }
              placeholder="โปรดระบุ"
              className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">จังหวัด</label>
        <SearchableSelect
          placeholder={loading ? 'กำลังโหลด...' : 'พิมพ์ชื่อจังหวัด'}
          value={province}
          onChange={handleProvince}
          options={provinces.map((p) => ({ value: p, label: p }))}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">เขต/อำเภอ</label>
        <SearchableSelect
          placeholder={!province ? 'เลือกจังหวัดก่อน' : 'พิมพ์ชื่ออำเภอ'}
          value={district}
          onChange={handleAmphoe}
          options={amphoes.map((a) => ({ value: a, label: a }))}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">แขวง/ตำบล</label>
        <SearchableSelect
          placeholder={!district ? 'เลือกอำเภอก่อน' : 'พิมพ์ชื่อตำบล'}
          value={subDistrict}
          onChange={handleSubDistrict}
          options={subDistricts.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">รหัสไปรษณีย์</label>
        <SearchableSelect
          placeholder="รหัสไปรษณีย์"
          value={postalCode}
          onChange={handlePostalCode}
          options={zipcodes.map((z) => ({ value: z, label: z }))}
        />
      </div>
    </div>
  );
}
