'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useTranslations } from 'next-intl';
import AIJobMatcher from '@/components/AIJobMatcher';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface WorkItem {
  id: string;
  company?: string;
  companyName?: string;
  position?: string;
  startYear?: string;
  endYear?: string;
  isCurrent?: boolean;
}

interface EducationItem {
  id: string;
  institution: string;
  educationLevel?: string;
  faculty?: string;
  major?: string;
}

interface LanguageItem {
  id: string;
  language: string;
  level?: string;
}

interface CertItem {
  id: string;
  name: string;
  issuedBy?: string;
}

interface ResumeInfo {
  id: string;
  title?: string;
  fileUrl?: string;
  createdAt?: string;
}

export default function AIJobMatcherPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations('AIjobmatch');

  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user?.role === 'EMPLOYER') {
      router.push('/');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user || user.role !== 'JOBSEEKER') return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
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
    ])
      .then(([edu, work, lang, cert, resumes]) => {
        setEducations(Array.isArray(edu) ? edu : []);
        setWorks(Array.isArray(work) ? work : []);
        setLanguages(Array.isArray(lang?.languages) ? lang.languages : []);
        setCerts(Array.isArray(cert) ? cert : []);
        setResume(Array.isArray(resumes) && resumes.length > 0 ? resumes[0] : null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-10 h-10 text-[#A80010] animate-spin" />
            <p className="text-sm text-[#020263] font-medium">กำลังเตรียม AI Job Matcher...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'JOBSEEKER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#00003D] via-[#020263] to-[#020263] text-white">
        <div className="absolute inset-0 opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,0,22,0.28),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(165,203,229,0.18),_transparent_30%)]" />
          <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-[#E00016]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#A5CBE5]/20 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#A5CBE5]/60 to-transparent" />
        </div>
        <div className="relative max-w-[1600px] mx-auto px-4 xl:px-8 py-14 lg:py-18">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-[#A5CBE5]/30 bg-white/8 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#A5CBE5] backdrop-blur">
              {t("aimatch")}
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  AI Job Matcher
                </h1>
                <p className="mt-4 max-w-3xl text-sm sm:text-base lg:text-lg text-[#E5EEF6] leading-relaxed">
                  {t('aimatcher')}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-[#A5CBE5]/25 bg-[#A5CBE5]/10 px-3 py-1.5 text-xs font-semibold text-[#A5CBE5]">
                    {t('useprofiledata')}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#E71F29]/25 bg-[#E71F29]/10 px-3 py-1.5 text-xs font-semibold text-[#FFD7DA]">
                    {t('fastanalyze')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#A5CBE5]/20 bg-white/10 px-4 py-4 backdrop-blur shadow-[0_10px_30px_rgba(0,0,61,0.25)]">
                <p className="text-xs font-semibold text-[#A5CBE5]">{t('initial_skills')}</p>
                <p className="mt-2 text-2xl font-black text-white">{languages.length + certs.length + works.length}</p>
                <p className="mt-1 text-xs text-[#D8E8F3]">{t('extracted_from_info')}</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-[#A5CBE5]" />
                </div>
              </div>
              <div className="rounded-2xl border border-[#E71F29]/20 bg-white/10 px-4 py-4 backdrop-blur shadow-[0_10px_30px_rgba(0,0,61,0.25)]">
                <p className="text-xs font-semibold text-[#FFD7DA]">{t('education')}</p>
                <p className="mt-2 text-2xl font-black text-white">{educations.length}</p>
                <p className="mt-1 text-xs text-[#F7D7DA]">{t('profile_prep_info')}</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-[#E00016]" />
                </div>
              </div>
              <div className="rounded-2xl border border-[#10B981]/20 bg-white/10 px-4 py-4 backdrop-blur shadow-[0_10px_30px_rgba(0,0,61,0.25)]">
                <p className="text-xs font-semibold text-[#A7F3D0]">{t('resume_analyzed')}</p>
                <p className="mt-2 text-2xl font-black text-white">{resume?.fileUrl ? t('status_ready') : t('status_missing')}</p>
                <p className="mt-1 text-xs text-[#D1FAE5]">{t('upload_pdf')}</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${resume?.fileUrl ? 'bg-[#10B981] w-full' : 'bg-[#16A34A] w-1/3'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 py-8 lg:py-10">
        <AIJobMatcher
          works={works}
          certs={certs}
          languages={languages}
          educations={educations}
          resume={resume}
        />
      </section>
      <Footer />
    </div>
  );
}
