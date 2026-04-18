'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Link } from '@/i18n/routing';

export default function ProfileVisibilityPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold tracking-wide text-indigo-700">
                โปรไฟล์สาธารณะ
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                เปิด–ปิดการเผยแพร่โปรไฟล์คืออะไร
              </h1>
              <p className="text-slate-600">
                ฟีเจอร์นี้ใช้สำหรับควบคุมการเผยแพร่โปรไฟล์ของคุณไปยังหน้านายจ้างค้นหาผู้หางาน
                เมื่อเปิดใช้งาน ระบบจะนำข้อมูลโปรไฟล์ของคุณไปแสดงในหน้ารวมผู้หางาน เพื่อให้นายจ้างสามารถค้นหาและติดต่อได้
              </p>
            </div>

            <div className="space-y-3 text-slate-700">
              <h2 className="text-lg font-bold text-slate-900">กรณีเปิดเผยโปรไฟล์</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>โปรไฟล์ของคุณจะแสดงในหน้าค้นหาผู้หางานของนายจ้าง</li>
                <li>ข้อมูลพื้นฐาน เช่น ชื่อ–นามสกุล จังหวัด ประวัติการศึกษา ประสบการณ์ และทักษะที่เกี่ยวข้องอาจถูกแสดง</li>
                <li>ช่วยเพิ่มโอกาสที่นายจ้างจะพบและติดต่อคุณเพื่อเสนองาน</li>
              </ul>
            </div>

            <div className="space-y-3 text-slate-700">
              <h2 className="text-lg font-bold text-slate-900">กรณีปิดโปรไฟล์</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>โปรไฟล์ของคุณจะไม่ปรากฏในหน้าค้นหาผู้หางาน</li>
                <li>ยังคงสามารถสมัครงานได้ตามปกติด้วยบัญชีของคุณ</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                คุณสามารถเปิดหรือปิดได้ที่หน้าโปรไฟล์เต็มของคุณ
              </div>
              <Link
                href="/profilefull"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#020263] px-4 py-2 text-sm font-semibold text-white hover:bg-[#11117c] transition-colors"
              >
                กลับไปจัดการโปรไฟล์
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

