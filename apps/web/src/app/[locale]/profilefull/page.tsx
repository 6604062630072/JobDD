'use client';

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  User,
  GraduationCap,
  Briefcase,
  Languages,
  CheckCircle2,
  Upload,
  Edit3,
  Plus,
  FileText,
  Trash2,
  ExternalLink,
  Loader2,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ProfileData {
  gender?: string;
  phone?: string;
  lineId?: string;
  nationality?: string;
  maritalStatus?: string;
  militaryStatus?: string;
  address?: string;
  province?: string;
  birthDate?: string;
  isPublic?: boolean;
}

interface EducationItem {
  id: string;
  institution: string;
  educationLevel?: string;
  faculty?: string;
  major?: string;
  graduationYear?: number;
}

interface WorkItem {
  id: string;
  companyName: string;
  position: string;
  startDate?: string;
  endDate?: string;
}

interface LanguageItem {
  id: string;
  language: string;
  level?: string;
  speaking?: string;
  reading?: string;
  writing?: string;
}

interface CertItem {
  id: string;
  name: string;
  issuedBy?: string;
  issueYear?: string;
  imageUrl?: string;
}

export default function ProfileFullPage() {
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [resume, setResume] = useState<{
    id: string;
    title: string;
    fileUrl?: string;
    createdAt: string;
  } | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user && user.role === 'EMPLOYER') router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/users/me/profile`, { headers })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${API_URL}/users/me/educations`, { headers })
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${API_URL}/users/me/work-histories`, { headers })
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${API_URL}/users/me/languages`, { headers })
        .then((r) => r.json())
        .catch(() => ({ languages: [], tests: [] })),
      fetch(`${API_URL}/users/me/certificates`, { headers })
        .then((r) => r.json())
        .catch(() => []),
      fetch(`${API_URL}/resumes`, { headers })
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([prof, edu, work, lang, cert, resumes]) => {
      setProfile(prof || null);
      setEducations(Array.isArray(edu) ? edu : []);
      setWorks(Array.isArray(work) ? work : []);
      setLanguages(Array.isArray(lang?.languages) ? lang.languages : []);
      setCerts(Array.isArray(cert) ? cert : []);
      if (Array.isArray(resumes) && resumes.length > 0) {
        setResume(resumes[0]);
      }
      setLoading(false);
    });
  }, [user]);

  const profileComplete = !!(
    profile?.phone ||
    profile?.gender ||
    profile?.nationality ||
    profile?.address
  );

  const levelColor = (level?: string) => {
    if (!level) return 'bg-slate-200';
    if (level.includes('เยี่ยม') || level.includes('Native')) return 'bg-emerald-500';
    if (level.includes('ดีมาก') || level.includes('Very')) return 'bg-blue-500';
    if (level.includes('ดี') || level.includes('Good')) return 'bg-cyan-500';
    if (level.includes('พอใช้') || level.includes('Fair')) return 'bg-amber-400';
    return 'bg-slate-300';
  };

  const levelWidth = (level?: string) => {
    if (!level) return '10%';
    if (level.includes('เยี่ยม') || level.includes('Native')) return '100%';
    if (level.includes('ดีมาก') || level.includes('Very')) return '80%';
    if (level.includes('ดี') || level.includes('Good')) return '65%';
    if (level.includes('พอใช้') || level.includes('Fair')) return '45%';
    if (level.includes('เบื้อง') || level.includes('Basic')) return '25%';
    return '20%';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('กรุณาอัปโหลดไฟล์ภาพ (JPG, PNG, WEBP) เท่านั้น');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์ภาพต้องมีขนาดไม่เกิน 5MB');
      return;
    }

    setAvatarUploading(true);
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/users/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      // Update global user context to reflect new avatar
      if (user) {
        setUser({ ...user, avatarUrl: data.avatarUrl });
      }
    } catch {
      alert('อัปโหลดรูปโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setAvatarUploading(false);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('ไฟล์ต้องมีขนาดไม่เกิน 10MB');
      return;
    }
    setResumeUploading(true);
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_URL}/resumes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setResume(data);
    } catch {
      alert('อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!resume) return;
    if (!confirm('ต้องการลบ Resume นี้ใช่ไหม?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`${API_URL}/resumes/${resume.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setResume(null);
    } catch {
      alert('ลบไม่สำเร็จ');
    }
  };

  const handleTogglePublic = async () => {
    const currentIsPublic = profile?.isPublic ?? true;
    const newStatus = !currentIsPublic;

    // Optimistic update
    const previousProfile = profile;
    const newProfile = profile
      ? { ...profile, isPublic: newStatus }
      : ({ isPublic: newStatus } as ProfileData);
    setProfile(newProfile);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/users/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');
    } catch (error) {
      console.error('Failed to update visibility', error);
      // Revert
      setProfile(previousProfile);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    );
  }

  const completionPercentage =
    ([
      profileComplete,
      educations.length > 0,
      works.length > 0,
      languages.length > 0,
      certs.length > 0,
      !!resume?.fileUrl,
    ].filter(Boolean).length /
      6) *
    100;

  const getCompletionColor = (percent: number) => {
    if (percent <= 30) return 'bg-red-600';
    if (percent <= 50) return 'bg-red-400';
    if (percent <= 70) return 'bg-orange-500';
    if (percent <= 80) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getCompletionTextColor = (percent: number) => {
    if (percent <= 30) return 'text-red-600';
    if (percent <= 50) return 'text-red-400';
    if (percent <= 70) return 'text-orange-500';
    if (percent <= 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen font-sans bg-[#f8fafc] relative">
      <Navbar />

      {/* Premium Header Profile Section */}
      <div className="relative w-full overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute top-0 left-0 w-full h-48 sm:h-64 bg-linear-to-r from-[#eef2f6] to-[#e2e8f0] overflow-hidden">
          {/* Abstract polygons inspired by the image */}
          <svg
            className="absolute inset-0 w-full h-full text-white/40"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path fill="currentColor" opacity="0.5" d="M0,0 L500,150 L1000,0 Z"></path>
            <path fill="rgba(255,255,255,0.7)" d="M400,0 L900,200 L1440,50 L1440,0 Z"></path>
            <path fill="#dce4ef" d="M800,0 L1440,250 L1440,0 Z"></path>
            <path fill="#dce4ef" d="M0,50 L400,250 L0,320 Z"></path>
          </svg>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 xl:px-8 relative z-10 pt-24 sm:pt-36 pb-8">
          {/* The White Profile Banner Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col xl:flex-row items-center xl:items-center gap-6 xl:gap-8 relative">
            {/* Avatar */}
            <label className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[6px] border-white shadow-lg flex items-center justify-center -mt-20 lg:-mt-24 shrink-0 relative overflow-hidden z-20 group bg-slate-100 cursor-pointer">
              {avatarUploading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
              {!avatarUploading && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit3 className="text-white w-6 h-6" />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
            </label>

            {/* Profile Main Info */}
            <div className="flex-1 text-center xl:text-left">
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {user?.firstName} {user?.lastName}
                </h1>
                {user?.role === 'JOBSEEKER' && <Sparkles className="w-3.5 h-3.5 fill-current" />}
              </div>
              <div className="text-slate-500 font-medium mt-3 flex flex-col items-center xl:items-start gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" /> {profile.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Right Side: Completion Bar */}
            <div className="w-full xl:w-[450px] bg-[#f8faff] rounded-3xl p-5 border border-indigo-50 shrink-0 shadow-xs">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h3 className="text-3xl font-bold text-slate-700">ความสมบูรณ์ของโปรไฟล์</h3>
                  <p className="text-[16px] text-slate-500 mt-1">
                    โปรไฟล์ที่สมบูรณ์มีโอกาสในการได้งานมากขึ้น {Math.round(completionPercentage)}%
                  </p>
                </div>
                <span
                  className={`text-xl font-bold ${getCompletionTextColor(completionPercentage)}`}
                >
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getCompletionColor(completionPercentage)} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            <div className="w-full xl:w-[450px] bg-[#f8faff] rounded-3xl p-5 border border-indigo-50 shrink-0 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-700">เผยแพร่โปรไฟล์</h3>
                  <p className="text-sm text-slate-500 mt-1">อนุญาตให้ค้นหาโปรไฟล์ของคุณได้</p>
                  <Link
                    href="/profile-visibility"
                    className="mt-2 inline-block text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 underline"
                  >
                    รายละเอียดเพิ่มเติม
                  </Link>
                </div>
                <button
                  onClick={handleTogglePublic}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    (profile?.isPublic ?? true) ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`${
                      (profile?.isPublic ?? true) ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Card 1: Personal Info */}
          <div className="bg-white rounded-4xl p-6 shadow-sm flex flex-col border border-slate-100/50 drop-shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#f4f7fe] text-[#4f75e2] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="text-xs text-[#4f75e2] bg-[#f4f7fe] hover:bg-blue-100 font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                แก้ไข
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[17px] mb-2">ข้อมูลส่วนบุคคล</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                ข้อมูลการติดต่อพื้นฐานเพื่อให้นายจ้างสามารถติดต่อคุณได้
              </p>
            </div>
            <div className="mt-auto">
              {profileComplete ? (
                <div className="inline-flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold bg-[#ecfdf3] px-3 py-1.5 rounded-full mb-4 border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ข้อมูลครบถ้วน
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-amber-600 text-[11px] font-bold bg-amber-50 px-3 py-1.5 rounded-full mb-4 border border-amber-100">
                  ยังกรอกข้อมูลไม่ครบ
                </div>
              )}
              {profile?.phone && (
                <div className="pt-4 border-t border-slate-100 text-[13px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 text-xs">โทรศัพท์:</span>
                    <span className="font-semibold text-slate-700">{profile.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Education */}
          <div className="bg-white rounded-4xl p-6 shadow-sm flex flex-col border border-slate-100/50 drop-shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#fef4eb] text-[#f97316] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <button
                onClick={() => router.push('/profile/education')}
                className="text-xs text-[#f97316] bg-[#fef4eb] hover:bg-orange-100 font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                จัดการ
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[17px] mb-2">ประวัติการศึกษา</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                วุฒิการศึกษาสูงสุดและสถาบันที่คุณจบการศึกษา
              </p>
            </div>
            <div className="mt-auto">
              {educations.length > 0 ? (
                <>
                  <div className="mb-4">
                    {educations.slice(0, 1).map((e) => (
                      <span
                        key={`pill-${e.id}`}
                        className="inline-block text-[11px] text-[#f97316] bg-[#fef4eb] font-bold px-3 py-1.5 rounded-full"
                      >
                        {e.educationLevel || 'ปริญญาตรี'}
                      </span>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-100 relative">
                    <div className="absolute left-0 top-[26px] w-[5px] h-[5px] bg-[#f97316] rounded-full"></div>
                    <div className="pl-4">
                      {educations.slice(0, 1).map((e) => (
                        <div key={e.id}>
                          <div className="text-[13px] font-semibold text-slate-800">
                            {e.faculty || e.major || 'การสื่อสาร'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {e.institution} {e.graduationYear ? `(${e.graduationYear})` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => router.push('/profile/education')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#f97316] text-[13px] font-bold text-slate-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มการศึกษา
                </button>
              )}
            </div>
          </div>

          {/* Card 3: Work History */}
          <div className="bg-white rounded-4xl p-6 shadow-sm flex flex-col border border-slate-100/50 drop-shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#f0fcfc] text-[#06b6d4] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <button
                onClick={() => router.push('/profile/work-history')}
                className="text-xs text-[#06b6d4] bg-[#f0fcfc] hover:bg-cyan-100 font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-3" />
                เพิ่ม
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[17px] mb-2">ประวัติการทำงาน</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                ประสบการณ์การทำงาน ตำแหน่ง และบริษัทที่เคยทำงาน
              </p>
            </div>
            <div className="mt-auto">
              {works.length > 0 ? (
                <div className="pt-4 border-t border-slate-100 relative">
                  <div className="absolute left-0 top-[26px] w-[5px] h-[5px] bg-[#06b6d4] rounded-full"></div>
                  <div className="pl-4">
                    {works.slice(0, 1).map((w) => (
                      <div key={w.id}>
                        <div className="text-[13px] font-semibold text-slate-800">{w.position}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{w.companyName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 relative">
                  <div className="absolute left-0 top-[26px] w-[5px] h-[5px] bg-[#06b6d4] rounded-full"></div>
                  <div className="pl-4">
                    <div className="text-[13px] font-semibold text-slate-800">กรุงเทพมหานคร</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Languages */}
          <div className="bg-white rounded-4xl p-6 shadow-sm flex flex-col border border-slate-100/50 drop-shadow-lg ">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#f0fdf4] text-[#22c55e] flex items-center justify-center">
                <Languages className="w-5 h-5" />
              </div>
              <button
                onClick={() => router.push('/profile/languages')}
                className="text-xs text-[#22c55e] bg-[#f0fdf4] hover:bg-green-100 font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                จัดการ
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[17px] mb-2">ทักษะด้านภาษา</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                ภาษาต่างประเทศที่สามารถสื่อสารได้และระดับความเชี่ยวชาญ
              </p>
            </div>
            <div className="mt-auto">
              {languages.length > 0 ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {languages.slice(0, 2).map((lang) => (
                    <div key={lang.id}>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="font-semibold text-slate-800 text-[13px]">
                          {lang.language}
                        </span>
                        <span className="text-[10px] font-bold text-[#22c55e] bg-[#f0fdf4] px-2 py-0.5 rounded-md">
                          {lang.level || 'ดีเยี่ยม (Excellent)'}
                        </span>
                      </div>
                      <div className="h-[5px] bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${levelColor(lang.level)}`}
                          style={{ width: levelWidth(lang.level) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="font-semibold text-slate-800 text-[13px]">ภาษาอังกฤษ</span>
                      <span className="text-[10px] font-bold text-[#22c55e] bg-[#f0fdf4] px-2 py-0.5 rounded-md">
                        ดีเยี่ยม (Excellent)
                      </span>
                    </div>
                    <div className="h-[5px] bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#22c55e] w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="font-semibold text-slate-800 text-[13px]">ภาษาไทย</span>
                      <span className="text-[10px] font-bold text-[#22c55e] bg-[#f0fdf4] px-2 py-0.5 rounded-md">
                        ดีเยี่ยม (Excellent)
                      </span>
                    </div>
                    <div className="h-[5px] bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#22c55e] w-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Resume */}
          <div className="bg-white rounded-4xl p-6 shadow-sm flex flex-col border border-slate-100/50 drop-shadow-lg ">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-[#fff1f2] text-[#ef4444] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              {resume ? (
                <button
                  onClick={handleResumeDelete}
                  className="text-xs text-[#ef4444] bg-[#fff1f2] hover:bg-red-100 font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ลบไฟล์
                </button>
              ) : (
                <div className="text-xs text-[#ef4444] bg-[#fff1f2] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 opacity-0 cursor-default select-none">
                  <Trash2 className="w-3.5 h-3.5" />
                  ลบไฟล์
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[17px] mb-2">เรซูเม่ (Resume)</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                อัปโหลดไฟล์ Resume (PDF) เพื่อใช้ในการสมัครงาน
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100">
              {resume?.fileUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#fff1f2] rounded-2xl">
                    <div className="w-8 h-8 rounded-lg text-[#ef4444] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">
                        {resume.title || 'resume.pdf'}
                      </p>
                    </div>
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#ef4444] p-1.5 bg-white rounded-md shadow-xs border border-slate-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <label className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200 hover:border-red-300 text-[13px] font-bold text-slate-600 hover:text-[#ef4444] cursor-pointer transition-colors bg-white">
                    <Upload className="w-4 h-4" />
                    อัปโหลดไฟล์
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={resumeUploading}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#fff1f2] rounded-2xl">
                    <div className="w-8 h-8 rounded-lg text-[#ef4444] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">
                        resume.pdf
                      </p>
                    </div>
                    <div className="text-slate-400 p-1.5 bg-white flex items-center justify-center rounded-md shadow-xs border border-slate-100">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <label className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200 hover:border-red-300 text-[13px] font-bold text-slate-600 hover:text-[#ef4444] cursor-pointer transition-colors bg-white">
                    {resumeUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        อัปโหลดไฟล์
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={resumeUploading}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
