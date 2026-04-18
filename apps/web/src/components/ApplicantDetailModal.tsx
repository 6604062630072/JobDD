'use client';

import { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Briefcase,
  GraduationCap,
  Globe,
  Mail,
  Phone,
  CalendarDays,
  ExternalLink,
  Download,
} from 'lucide-react';

interface ApplicantDetailModalProps {
  applicationId: string;
  onClose: () => void;
}

interface ApplicantProfile {
  nationality?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  address?: string | null;
  subDistrict?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
}

interface ApplicantWorkHistory {
  position?: string | null;
  company?: string | null;
  startMonth?: string | null;
  startYear?: string | null;
  endMonth?: string | null;
  endYear?: string | null;
  isCurrent?: boolean | null;
}

interface ApplicantEducation {
  educationLevel?: string | null;
  degreeName?: string | null;
  major?: string | null;
  institution?: string | null;
  graduationYear?: string | number | null;
  gpa?: string | number | null;
}

interface ApplicantResume {
  title?: string | null;
  fileUrl?: string | null;
}

interface ApplicantUser {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  profile?: ApplicantProfile | null;
  workHistories?: ApplicantWorkHistory[];
  educations?: ApplicantEducation[];
}

interface ApplicantDetailData {
  user: ApplicantUser;
  resume?: ApplicantResume | null;
  job?: {
    title?: string | null;
  } | null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function ApplicantDetailModal({ applicationId, onClose }: ApplicantDetailModalProps) {
  const [data, setData] = useState<ApplicantDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'resume'>('profile');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/applications/${applicationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || 'Failed to open applicant details');
        }
        setData(json);
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to open applicant details'));
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลผู้สมัคร...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">ไม่สามารถโหลดข้อมูลได้</h3>
          <p className="text-sm text-gray-500 mb-6">{error || 'เกิดข้อผิดพลาดบางอย่าง'}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  const user = data.user;
  const profile = user.profile;
  const resume = data.resume;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear() + 543}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 p-6 sm:p-8 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shrink-0 overflow-hidden shadow-inner border-4 border-white">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (user.firstName || 'U').charAt(0)
              )}
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="inline-block px-3 py-1 bg-blue-50 text-[#E00016] text-xs font-semibold rounded-full mb-2 border border-blue-100">
                ตำแหน่งที่สมัคร: {data.job?.title}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h2>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 mt-4 text-sm text-gray-600">
                {user.email && (
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {user.email}
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {user.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-8 -mb-8 sm:-mb-8 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'profile' ? 'border-[#E00016] text-[#020263]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              ข้อมูลส่วนตัว & ประสบการณ์
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'resume' ? 'border-[#E00016] text-[#020263]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <FileText className="w-4 h-4" />
              เอกสารเรซูเม่
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-gray-50/50">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic Profile */}
              {profile && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </span>
                    ข้อมูลทั่วไป
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">สัญชาติ</span>
                      <span className="font-medium text-gray-800">
                        {profile.nationality || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">วันเกิด</span>
                      <span className="font-medium text-gray-800">
                        {formatDate(profile.birthDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">เพศ</span>
                      <span className="font-medium text-gray-800">{profile.gender || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">สถานภาพ</span>
                      <span className="font-medium text-gray-800">
                        {profile.maritalStatus || '-'}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-4">
                      <span className="text-gray-500 block text-xs mb-1">ที่อยู่ปัจจุบัน</span>
                      <span className="font-medium text-gray-800">
                        {[
                          profile.address,
                          profile.subDistrict,
                          profile.district,
                          profile.province,
                          profile.postalCode,
                        ]
                          .filter(Boolean)
                          .join(' ') || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Work History */}
              {user.workHistories && user.workHistories.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    ประสบการณ์ทำงาน ({user.workHistories.length})
                  </h3>
                  <div className="space-y-4">
                    {user.workHistories.map((work, idx: number) => (
                      <div
                        key={idx}
                        className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="absolute w-3 h-3 bg-white border-2 border-emerald-500 rounded-full -left-[7.5px] top-1"></div>
                        <h4 className="font-bold text-gray-800 text-sm">{work.position}</h4>
                        <div className="text-sm font-medium text-emerald-600 mt-0.5">
                          {work.company}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1.5 mb-2">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {work.startMonth}/{work.startYear} -{' '}
                          {work.isCurrent ? 'ปัจจุบัน' : `${work.endMonth}/${work.endYear}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {user.educations && user.educations.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    ประวัติการศึกษา ({user.educations.length})
                  </h3>
                  <div className="space-y-4">
                    {user.educations.map((edu, idx: number) => (
                      <div
                        key={idx}
                        className="relative pl-6 pb-4 border-l-2 border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="absolute w-3 h-3 bg-white border-2 border-purple-500 rounded-full -left-[7.5px] top-1"></div>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {edu.educationLevel} {edu.degreeName ? `- ${edu.degreeName}` : ''}{' '}
                          {edu.major ? `(${edu.major})` : ''}
                        </h4>
                        <div className="text-sm font-medium text-purple-600 mt-0.5">
                          {edu.institution}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1.5 mb-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          ปีที่สำเร็จการศึกษา: {edu.graduationYear || '-'}
                        </div>
                        {edu.gpa && (
                          <div className="text-xs font-semibold text-gray-700 bg-gray-100 inline-block px-2 py-0.5 rounded">
                            GPA: {edu.gpa}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Profile check */}
              {!profile &&
                (!user.workHistories || user.workHistories.length === 0) &&
                (!user.educations || user.educations.length === 0) && (
                  <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Globe className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>ผู้สมัครยังไม่ได้กรอกข้อมูลโปรไฟล์</p>
                  </div>
                )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center min-h-[400px]">
              {!resume ? (
                <div className="text-center py-10 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>ผู้สมัครไม่ได้แนบไฟล์ Resume แบบเต็ม</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {resume.title || 'Resume File'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                    เอกสารประกอบการสมัครงาน หากเป็นไฟล์ PDF คุณสามารถดาวน์โหลดหรือกดดูได้เลย
                  </p>

                  {resume.fileUrl ? (
                    <div className="flex gap-3">
                      <a
                        href={resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#E00016] hover:bg-[#A80010] text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-5 h-5" />
                        เปิดดูไฟล์ Resume
                      </a>
                      <a
                        href={resume.fileUrl}
                        download
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-xl text-sm border border-amber-100">
                      ไฟล์ Resume นี้ถูกสร้างอัตโนมัติจากระบบ (ไม่มีไฟล์แนบ) <br />
                      โปรดดูข้อมูลที่แท็บ &quot;ข้อมูลส่วนตัว & ประสบการณ์&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
