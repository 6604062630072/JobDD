'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { ChevronLeft, Users, FileText, Download, XCircle, CalendarDays, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

type AppStatus =
  | 'PENDING'
  | 'REVIEWED'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN';

const STATUS_LABEL: Record<AppStatus, { label: string; color: string }> = {
  PENDING: { label: 'รอพิจารณา', color: 'bg-yellow-100 text-yellow-700' },
  REVIEWED: { label: 'ตรวจสอบแล้ว', color: 'bg-blue-100 text-blue-700' },
  SHORTLISTED: { label: 'เข้ารอบ', color: 'bg-indigo-100 text-indigo-700' },
  INTERVIEW: { label: 'นัดสัมภาษณ์', color: 'bg-purple-100 text-purple-700' },
  OFFERED: { label: 'ยื่นข้อเสนอ', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-700' },
  WITHDRAWN: { label: 'สละสิทธิ์', color: 'bg-gray-100 text-gray-700' },
};

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

interface Resume {
  id: string;
  title: string;
  fileUrl?: string;
  summary?: string;
  experience: { position: string; company: string; startDate: string; endDate?: string; description?: string }[];
  education: { institution: string; degree: string; field?: string; startDate: string; endDate: string }[];
  skills: string[];
  certifications: string[];
}

interface Application {
  id: string;
  status: AppStatus;
  appliedAt: string;
  interviewDate?: string;
  coverLetter?: string;
  user: User;
  resume: Resume;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hrs / 24);
  return `${days} วันที่แล้ว`;
}

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [interviewModal, setInterviewModal] = useState<{ appId: string; current?: string } | null>(
    null,
  );
  const [interviewDate, setInterviewDate] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/employer/login');
      return;
    }
    if (!authLoading && user && user.role !== 'EMPLOYER') {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'EMPLOYER' || !jobId) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`${API_URL}/jobs/${jobId}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, jobId]);

  const handleStatusChange = async (appId: string, newStatus: AppStatus) => {
    setUpdating(appId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');

      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
      );
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setUpdating(null);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewModal || !interviewDate) return;
    setUpdating(interviewModal.appId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/applications/${interviewModal.appId}/interview`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interviewDate: new Date(interviewDate).toISOString() }),
      });
      if (!res.ok) throw new Error('Failed');
      setApplications((prev) =>
        prev.map((a) =>
          a.id === interviewModal.appId
            ? {
                ...a,
                status: 'INTERVIEW' as AppStatus,
                interviewDate: new Date(interviewDate).toISOString(),
              }
            : a,
        ),
      );
      setInterviewModal(null);
      setInterviewDate('');
    } catch {
      alert('เกิดข้อผิดพลาดในการนัดสัมภาษณ์');
    } finally {
      setUpdating(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/employer/jobs')}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">จัดการผู้สมัคร</h1>
              <p className="text-xs text-gray-400">ผู้สมัครทั้งหมด {applications.length} คน</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-gray-500 font-medium mb-2">ยังไม่มีผู้สมัครสำหรับงานนี้</div>
            <p className="text-gray-400 text-sm">เมื่อมีผู้ใช้สมัครงาน ข้อมูลจะแสดงที่นี่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Applicant Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0 font-bold text-blue-600 text-xl">
                    {app.user.avatarUrl ? (
                      <img
                        src={app.user.avatarUrl}
                        alt={app.user.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      app.user.firstName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {app.user.firstName} {app.user.lastName}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span>📧 {app.user.email}</span>
                      {app.user.phone && <span>📱 {app.user.phone}</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      สมัครเมื่อ: {new Date(app.appliedAt).toLocaleString('th-TH')} (
                      {timeAgo(app.appliedAt)})
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Interview date display */}
                  {app.interviewDate && (
                    <div className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-lg font-medium">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(app.interviewDate).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      <Clock className="w-3 h-3 ml-1" />
                      {new Date(app.interviewDate).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}

                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as AppStatus)}
                      disabled={updating === app.id}
                      className={`h-11 px-4 border text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-no-repeat bg-right disabled:opacity-50 ${STATUS_LABEL[app.status].color}`}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
                        backgroundSize: '16px',
                        backgroundPosition: 'calc(100% - 12px) center',
                        paddingRight: '36px',
                      }}
                    >
                      {Object.entries(STATUS_LABEL).map(([key, { label }]) => (
                        <option key={key} value={key} className="text-gray-900 bg-white">
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setInterviewModal({ appId: app.id, current: app.interviewDate });
                      setInterviewDate(
                        app.interviewDate
                          ? new Date(app.interviewDate).toISOString().slice(0, 16)
                          : '',
                      );
                    }}
                    className="flex items-center gap-1.5 px-4 h-11 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold rounded-xl transition-colors text-sm"
                  >
                    <CalendarDays className="w-4 h-4" />
                    นัดสัมภาษณ์
                  </button>

                  <button
                    onClick={() => setSelectedApp(app)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 h-11 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    ดูเรซูเม่
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedApp(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800">ข้อมูลผู้สมัคร</h2>
                <p className="text-sm text-gray-500">
                  {selectedApp.user.firstName} {selectedApp.user.lastName}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-8 bg-gray-50 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center overflow-hidden font-bold text-blue-600 text-3xl mb-4">
                      {selectedApp.user.avatarUrl ? (
                        <img
                          src={selectedApp.user.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedApp.user.firstName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedApp.user.firstName} {selectedApp.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{selectedApp.user.email}</p>

                    <div className="space-y-3 text-sm text-left border-t border-gray-100 pt-4">
                      {selectedApp.user.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="shrink-0">📱</span> {selectedApp.user.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="shrink-0">📅</span> สมัครเมื่อ{' '}
                        {new Date(selectedApp.appliedAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>

                  {selectedApp.coverLetter && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="font-bold text-gray-800 mb-3 text-sm">
                        ข้อความถึงผู้ประกอบการ (Cover Letter)
                      </h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {selectedApp.coverLetter}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Content - Resume Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Resume Header */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        เรซูเม่ที่ใช้สมัคร
                      </h3>
                      {selectedApp.resume.fileUrl && (
                        <a
                          href={selectedApp.resume.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" /> ไฟล์ PDF
                        </a>
                      )}
                    </div>

                    <div className="font-semibold text-gray-800 mb-2">
                      {selectedApp.resume.title}
                    </div>
                    {selectedApp.resume.summary && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedApp.resume.summary}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  {selectedApp.resume.skills.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="font-bold text-gray-800 mb-4 text-sm">
                        ทักษะความสามารถ (Skills)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.resume.skills.map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {selectedApp.resume.experience.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="font-bold text-gray-800 mb-4 text-sm">
                        ประสบการณ์ทำงาน (Experience)
                      </h4>
                      <div className="space-y-5">
                        {selectedApp.resume.experience.map((exp, i) => (
                          <div key={i} className="relative pl-4 border-l-2 border-gray-200">
                            <div className="absolute w-2.5 h-2.5 bg-gray-400 rounded-full -left-[6px] top-1.5 ring-4 ring-white" />
                            <h5 className="font-bold text-gray-800 text-sm">{exp.position}</h5>
                            <div className="text-sm font-medium text-blue-600 mt-0.5">
                              {exp.company}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {exp.startDate} - {exp.endDate || 'ปัจจุบัน'}
                            </div>
                            {exp.description && (
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedApp.resume.education.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="font-bold text-gray-800 mb-4 text-sm">
                        ประวัติการศึกษา (Education)
                      </h4>
                      <div className="space-y-4">
                        {selectedApp.resume.education.map((edu, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                              🎓
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-800 text-sm">{edu.institution}</h5>
                              <div className="text-sm text-gray-600 mt-0.5">
                                {edu.degree} {edu.field && `• ${edu.field}`}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {edu.startDate} - {edu.endDate}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-8 py-4 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Interview scheduling modal */}
      {interviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setInterviewModal(null);
              setInterviewDate('');
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600" />
              นัดสัมภาษณ์
            </h2>
            <p className="text-sm text-gray-500 mb-5">เลือกวันที่และเวลาสัมภาษณ์</p>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full h-12 px-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setInterviewModal(null);
                  setInterviewDate('');
                }}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleScheduleInterview}
                disabled={!interviewDate || updating === interviewModal.appId}
                className="flex-1 h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                บันทึกนัดสัมภาษณ์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
