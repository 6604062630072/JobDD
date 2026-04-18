'use client';

import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import Image from 'next/image';

export default function RegisterLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EAEAEA]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-[#020263] pt-10">กรุณาเลือกประเภทบัญชีผู้ใช้งาน?</h1>
            <p className="mt-4 text-[#202063] text-xl">เลือกรูปแบบที่ตรงกับความต้องการของคุณเพื่อดำเนินการต่อ</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Job Seeker Card */}
            <Link
              href="/register/jobseeker"
              className="group relative bg-[#FFFFFF] rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#020263] transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-100 h-100 mb-0 relative transition-transform group-hover:scale-105 duration-300">
                <Image
                  src="/images/job-seeker-2d.png"
                  alt="ผู้สมัครงาน"
                  fill
                  className="object-contain rounded-xl mix-blend-multiply"
                />
              </div>
              <h2 className="text-xl font-bold text-[#00003D] mb-3">ผู้สมัครงาน</h2>
              <p className="text-gray-500 mb-6">
                สร้างโปรไฟล์ส่วนตัว ค้นหาตำแหน่งงาน และสมัครงานกับองค์กรชั้นนำทั่วประเทศ
              </p>
              <span className="mt-auto w-full">
                <button className="w-full py-3 px-6 bg-[#00003D] text-white font-semibold rounded-xl group-hover:bg-[#020263] transition-colors duration-200">
                  ลงทะเบียนผู้สมัครงาน
                </button>
              </span>
            </Link>

            {/* Employer Card */}
            <Link
              href="/register/employer"
              className="group relative bg-[#FFFFFF] rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#020263] transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-100 h-100 mb-0 relative transition-transform group-hover:scale-105 duration-300">
                <Image
                  src="/images/employer-2d.png"
                  alt="ผู้ประกอบการ"
                  fill
                  className="object-contain rounded-xl mix-blend-multiply"
                />
              </div>
              <h2 className="text-xl font-bold text-[#00003D] mb-3">
                ผู้ประกอบการ / ฝ่ายบุคคล
              </h2>
              <p className="text-gray-500 mb-6">
                เข้าถึงคลังประวัติผู้สมัคร ลงประกาศตำแหน่งงาน และสรรหาบุคลากรอย่างมีประสิทธิภาพ
              </p>
              <span className="mt-auto w-full">
                <button className="w-full py-3 px-6 bg-[#00003D] text-white font-semibold rounded-xl group-hover:bg-[#020263] transition-colors duration-200">
                  ลงทะเบียนองค์กร
                </button>
              </span>
            </Link>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href="/login" className="text-[#E00016] font-medium hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
