'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { Building2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function EmployerLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setError(msg || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return;
      }

      if (data.user?.role !== 'EMPLOYER') {
        setError('บัญชีนี้ไม่ใช่บัญชีผู้ประกอบการ กรุณาใช้หน้าเข้าสู่ระบบสำหรับผู้หางาน');
        return;
      }

      login(data.accessToken, data.user);
      router.push('/employer/dashboard');
    } catch {
      setError('ไม่สามารถเชื่อมต่อ API ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            เข้าสู่ระบบสำหรับผู้หางาน →
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบผู้ประกอบการ</h1>
              <p className="mt-2 text-gray-500 text-sm">จัดการประกาศงานและผู้สมัครของคุณ</p>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลบริษัท</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all text-gray-900"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all text-gray-900"
                  placeholder="รหัสผ่าน"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-center">
              <div className="text-sm text-gray-500">
                ยังไม่มีบัญชี?{' '}
                <Link
                  href="/register/employer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  ลงทะเบียนบริษัท
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
