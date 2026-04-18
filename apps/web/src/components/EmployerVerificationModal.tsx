'use client';

import { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface EmployerVerificationModalProps {
    companyId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
};

const readApiErrorMessage = async (response: Response, fallbackMessage: string) => {
    try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            if (typeof data?.message === 'string' && data.message.trim()) {
                return data.message;
            }
            if (Array.isArray(data?.message) && data.message.length > 0) {
                return data.message.join(', ');
            }
            if (typeof data?.error === 'string' && data.error.trim()) {
                return data.error;
            }
        }

        const text = await response.text();
        return text || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
};

export function EmployerVerificationModal({ companyId, onClose, onSuccess }: EmployerVerificationModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = selectedFiles.filter(file => {
                if (file.type !== 'application/pdf') {
                    setError(`ไฟล์ ${file.name} ต้องเป็น PDF เท่านั้น`);
                    return false;
                }

                if (file.size > 10 * 1024 * 1024) {
                    setError(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 10MB`);
                    return false;
                }
                return true;
            });
            setFiles(prev => [...prev, ...validFiles]);
            setError('');
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            setError('กรุณาอัปโหลดเอกสารอย่างน้อย 1 ฉบับ');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('กรุณาเข้าสู่ระบบใหม่');

            const myCompanyRes = await fetch(`${API_URL}/companies/mine`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!myCompanyRes.ok) {
                throw new Error(await readApiErrorMessage(myCompanyRes, 'ไม่สามารถโหลดข้อมูลบริษัทล่าสุดได้'));
            }

            const myCompany = await myCompanyRes.json();
            const activeCompanyId = typeof myCompany?.id === 'string' && myCompany.id.trim() ? myCompany.id : companyId;
            if (!activeCompanyId) {
                throw new Error('ไม่พบข้อมูลบริษัท กรุณารีเฟรชหน้าแล้วลองใหม่อีกครั้ง');
            }

            const uploadedUrls: string[] = [];

            // Upload each file
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch(`${API_URL}/upload/document`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!uploadRes.ok) {
                    throw new Error(await readApiErrorMessage(uploadRes, `ไม่สามารถอัปโหลดไฟล์ ${file.name} ได้`));
                }

                const data = await uploadRes.json();
                uploadedUrls.push(data.url);
            }

            // Submit verification with document URLs
            const verifyRes = await fetch(`${API_URL}/companies/${activeCompanyId}/verify-submit`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ verificationDocs: uploadedUrls }),
            });

            if (!verifyRes.ok) {
                throw new Error(await readApiErrorMessage(verifyRes, 'เกิดข้อผิดพลาดในการส่งคำขอยืนยันตัวตน'));
            }

            onSuccess();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
                    <h2 className="text-xl font-bold text-gray-800">ยืนยันตัวตนบริษัท</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="px-8 py-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">เอกสารที่ต้องใช้ (เลือกอย่างใดอย่างหนึ่ง):</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>หนังสือรับรองการจดทะเบียนบริษัท (อายุไม่เกิน 6 เดือน)</li>
                                <li>ใบทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">อัปโหลดเอกสาร</label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
                            <span className="text-sm text-gray-500 font-medium">คลิกเพื่ออัปโหลด</span>
                            <span className="text-xs text-gray-400 mt-1">รองรับไฟล์ PDF (ขนาดไม่เกิน 10MB)</span>
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,application/pdf"
                                multiple
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">ไฟล์ที่เลือก:</h4>
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                                        <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-4 flex gap-3 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || files.length === 0}
                        className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                กำลังอัปโหลด...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                ส่งเอกสารยืนยัน
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
