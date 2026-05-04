'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SearchableSelect } from '@/components/SearchableSelect';
import {
  User,
  GraduationCap,
  Briefcase,
  Languages,
  Award,
  Trash2,
  Loader2,
  Check,
  Car,
  PlusCircle,
} from 'lucide-react';
import { THAI_UNIVERSITIES as UNIVERSITIES } from '@/data/thai-universities';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const profileSteps = [
  { icon: User, label: 'ข้อมูลส่วนบุคคล', completed: true, active: false },
  { icon: GraduationCap, label: 'ประวัติการศึกษา', completed: false, active: true },
  { icon: Briefcase, label: 'ประวัติการทำงาน', completed: false, active: false },
  { icon: Languages, label: 'ความสามารถทางภาษา', completed: false, active: false },
  { icon: Car, label: 'ทักษะการขับขี่', completed: false, active: false },
  { icon: Award, label: 'ใบประกาศนียบัตร', completed: false, active: false },
];

// Thai Education Levels
const EDUCATION_LEVELS = [
  'ต่ำกว่ามัธยมศึกษาตอนปลาย',
  'มัธยมศึกษาตอนปลาย',
  'ปวช.',
  'ปวส.',
  'ปริญญาตรี',
  'ปริญญาโท',
  'ปริญญาเอก',
];

// รายชื่อคณะมาตรฐานในไทย
const FACULTIES = [
  "คณะเกษตรศาสตร์",
  "คณะครุศาสตร์",
  "คณะครุศาสตร์อุตสาหกรรม",
  "คณะดุริยางคศิลป์",
  "คณะทันตแพทยศาสตร์",
  "คณะเทคนิคการแพทย์",
  "คณะเทคโนโลยี",
  "คณะเทคโนโลยีทางทะเล",
  "คณะเทคโนโลยีสารสนเทศ",
  "คณะนิติศาสตร์",
  "คณะนิเทศศาสตร์",
  "คณะบริหารธุรกิจ",
  "คณะโบราณคดี",
  "คณะประมง",
  "คณะพยาบาลศาสตร์",
  "คณะพาณิชยศาสตร์และการบัญชี",
  "คณะแพทยศาสตร์",
  "คณะเภสัชศาสตร์",
  "คณะโภชนศาสตร์",
  "คณะมนุษยศาสตร์",
  "คณะมัณฑนศิลป์",
  "คณะวนศาสตร์",
  "คณะวารสารศาสตร์และสื่อสารมวลชน",
  "คณะวิจิตรศิลป์",
  "คณะวิทยาการจัดการ",
  "คณะวิทยาการสารสนเทศ",
  "คณะวิทยาศาสตร์",
  "คณะวิทยาศาสตร์การกีฬา",
  "คณะวิศวกรรมศาสตร์",
  "คณะศิลปกรรมศาสตร์",
  "คณะศิลปศาสตร์",
  "คณะศิลปะและการออกแบบ",
  "คณะเศรษฐศาสตร์",
  "คณะสถาปัตยกรรมศาสตร์",
  "คณะสหเวชศาสตร์",
  "คณะสัตวแพทยศาสตร์",
  "คณะสังคมสงเคราะห์ศาสตร์",
  "คณะสังคมศาสตร์",
  "คณะสาธารณสุขศาสตร์",
  "คณะศึกษาศาสตร์",
  "คณะสิ่งแวดล้อมและทรัพยากรศาสตร์",
  "คณะอุตสาหกรรมเกษตร",
  "คณะอุตสาหกรรมสร้างสรรค์",
  "คณะอักษรศาสตร์",
  "วิทยาลัยการคอมพิวเตอร์",
  "วิทยาลัยการภาพยนตร์ ศิลปะการแสดงและสื่อใหม่",
  "วิทยาลัยนานาชาติ",
  "วิทยาลัยนวัตกรรม",
  "วิทยาลัยป๊อปพิวเลชันศาสตร์",
  "วิทยาลัยสื่อสารการเมือง"
];

const currentYear = new Date().getFullYear() + 543;
const graduationYears = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

interface EducationEntry {
  id: string;
  institution: string;
  faculty: string;
  major: string;
  educationLevel: string;
  degreeName: string;
  graduationYear: string;
  gpa: string;
  hasHonors: boolean;
}

interface SavedEducationEntry {
  id: string;
  institution: string;
  faculty: string;
  major: string;
  educationLevel: string;
  degreeName: string;
  graduationYear: number | null;
  gpa: number | null;
  hasHonors: boolean;
}

function createEntry(): EducationEntry {
  return {
    id: Math.random().toString(36).slice(2),
    institution: '',
    faculty: '',
    major: '',
    educationLevel: '',
    degreeName: '',
    graduationYear: '',
    gpa: '',
    hasHonors: false,
  };
}

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

function getApiErrorMessage(errorData: unknown, fallback: string) {
  if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
    const message = (errorData as { message?: string | string[] }).message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string' && message) {
      return message;
    }
  }

  return fallback;
}

export default function EducationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<EducationEntry[]>([createEntry()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  const [completionPercent, setCompletionPercent] = useState(17);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load existing education data
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    setCompletionPercent(17);
    fetch(`${API_URL}/users/me/educations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEntries(
            data.map((d: SavedEducationEntry) => ({
              id: d.id || Math.random().toString(36).slice(2),
              institution: d.institution || '',
              faculty: d.faculty || '',
              major: d.major || '',
              educationLevel: d.educationLevel || '',
              degreeName: d.degreeName || '',
              graduationYear: d.graduationYear != null ? String(d.graduationYear) : '',
              gpa: d.gpa != null ? String(d.gpa) : '',
              hasHonors: d.hasHonors || false,
            })),
          );
        }
      })
      .catch(() => { });
  }, [user]);

  const updateEntry = (id: string, field: keyof EducationEntry, value: string | boolean) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeEntry = (id: string) => {
    if (entries.length === 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, createEntry()]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('accessToken');
      // Filter out entries without institution name
      const validEntries = entries.filter((e) => e.institution && e.institution.trim() !== '');

      const res = await fetch(`${API_URL}/users/me/educations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: validEntries.map(({ id, graduationYear, gpa, ...rest }) => {
            const parsedYear = graduationYear ? parseInt(graduationYear, 10) : undefined;
            const parsedGpa = gpa ? parseFloat(gpa) : undefined;
            return {
              ...rest,
              graduationYear: parsedYear != null && !isNaN(parsedYear) ? parsedYear : undefined,
              gpa: parsedGpa != null && !isNaN(parsedGpa) ? parsedGpa : undefined,
            };
          }),
        }),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 404) {
          localStorage.removeItem('accessToken');
          router.push('/login');
          return;
        }
        const errorData = await res.json().catch(() => null);
        throw new Error(getApiErrorMessage(errorData, 'Save failed'));
      }
      setSaving(false);
      setMessage({ type: 'success', text: 'บันทึกประวัติการศึกษาเรียบร้อยแล้ว ✓' });
      setCompletionPercent(34);
      setTimeout(() => router.push('/profile/work-history'), 1000);
    } catch (error: unknown) {
      setSaving(false);
      setMessage({
        type: 'error',
        text: getErrorMessage(error, 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'),
      });
    }
  };

  const handleBack = () => router.push('/profile');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* Progress Banner */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0e2a5e 40%, #1a3a7a 70%, #243b82 100%)',
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
          />
          <div
            className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full bg-linear-to-b from-blue-400 to-cyan-400" />
            <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-semibold tracking-wide">
              ความสมบูรณ์ของโปรไฟล์
            </h2>
          </div>

          {/* Main Glass Card */}
          <div
            className="rounded-2xl border border-white/10 p-6 md:p-8"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Progress Ring */}
              <div className="relative shrink-0">
                <div className="relative w-32 h-32 md:w-36 md:h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="50%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      {completionPercent}%
                    </span>
                    <span className="text-[10px] text-blue-300/80 mt-0.5">สำเร็จ</span>
                  </div>
                </div>
                <div
                  className="absolute inset-0 rounded-full opacity-20 blur-xl"
                  style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }}
                />
              </div>

              {/* Steps */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 sm:gap-2">
                  {profileSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <button
                        key={index}
                        className={`group relative flex sm:flex-col items-center gap-3 sm:gap-2.5 p-3 sm:p-4 rounded-xl transition-all duration-300 cursor-pointer
                          ${step.active
                            ? 'bg-white/15 border border-white/20 shadow-lg shadow-blue-500/10'
                            : 'hover:bg-white/6 border border-transparent'
                          }`}
                      >
                        <div
                          className={`relative shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300
                          ${step.completed
                              ? 'bg-linear-to-br from-blue-400 to-cyan-400 shadow-md shadow-cyan-400/20'
                              : step.active
                                ? 'bg-white/15 border border-white/20'
                                : 'bg-white/6 border border-white/10'
                            }`}
                        >
                          {step.completed ? (
                            <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                          ) : (
                            <Icon
                              className={`w-5 h-5 ${step.active ? 'text-blue-300' : 'text-white/30'}`}
                            />
                          )}
                        </div>
                        <span
                          className={`text-xs sm:text-[11px] sm:text-center leading-tight font-medium transition-colors
                          ${step.active || step.completed ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}
                        >
                          {step.label}
                        </span>
                        {step.active && (
                          <div className="sm:hidden ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="hidden sm:block mt-5">
                  <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${completionPercent}%`,
                        background: 'linear-gradient(90deg, #60a5fa, #38bdf8, #22d3ee)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-white/30">
                    <span>เริ่มต้น</span>
                    <span>สมบูรณ์</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 mb-6"
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                การศึกษาที่ {idx + 1}
              </h2>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                  title="ลบรายการนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Row 1: Institution */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อสถานศึกษา</label>
              <SearchableSelect
                placeholder="โปรดเลือก"
                value={entry.institution}
                onChange={(val) => updateEntry(entry.id, 'institution', val)}
                options={UNIVERSITIES.map((u) => ({ value: u, label: u }))}
              />
            </div>

            {/* Row 2: Faculty & Major */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">คณะ</label>
                {/* แก้ไขจาก input เป็น SearchableSelect */}
                <SearchableSelect
                  placeholder="เลือกหรือพิมพ์ชื่อคณะ"
                  value={entry.faculty}
                  onChange={(val) => updateEntry(entry.id, 'faculty', val)}
                  options={FACULTIES.map((f) => ({ value: f, label: f }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">สาขา</label>
                <input
                  type="text"
                  value={entry.major}
                  onChange={(e) => updateEntry(entry.id, 'major', e.target.value)}
                  placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                  className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Row 3: Education Level & Degree Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ระดับการศึกษา</label>
                <SearchableSelect
                  placeholder="โปรดเลือก"
                  value={entry.educationLevel}
                  onChange={(val) => updateEntry(entry.id, 'educationLevel', val)}
                  options={EDUCATION_LEVELS.map((l) => ({ value: l, label: l }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อปริญญา</label>
                <input
                  type="text"
                  value={entry.degreeName}
                  onChange={(e) => updateEntry(entry.id, 'degreeName', e.target.value)}
                  placeholder="ระบุ"
                  className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Row 4: Graduation Year & GPA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ปีที่สำเร็จการศึกษา
                </label>
                <SearchableSelect
                  placeholder="โปรดเลือก"
                  value={entry.graduationYear}
                  onChange={(val) => updateEntry(entry.id, 'graduationYear', val)}
                  options={graduationYears.map((y) => ({ value: y, label: y }))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">เกรดเฉลี่ย</label>
                <input
                  type="text"
                  value={entry.gpa}
                  onChange={(e) => updateEntry(entry.id, 'gpa', e.target.value)}
                  placeholder="ระบุ"
                  className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Row 5: Honors toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={entry.hasHonors}
                onClick={() => updateEntry(entry.id, 'hasHonors', !entry.hasHonors)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${entry.hasHonors ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${entry.hasHonors ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className="text-sm text-gray-600">เกียรตินิยม (ถ้ามี)</span>
            </div>
          </div>
        ))}

        <div className="flex justify-center mb-8">
          <button
            onClick={addEntry}
            className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-full border border-dashed border-blue-300"
          >
            <PlusCircle className="w-5 h-5" />
            เพิ่มประวัติการศึกษา
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleBack}
            className="px-8 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition-colors"
          >
            ย้อนกลับ
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white px-12 py-3 rounded-lg font-bold text-lg shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกและถัดไป'
            )}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
