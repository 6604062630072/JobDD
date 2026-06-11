# Admin Dashboard - JobDD

## ภาพรวม

Admin Dashboard เป็นหน้าแรกของ Admin Panel ที่ให้ผู้ดูแลระบบสามารถดูสถิติและจัดการระบบ JobDD ได้อย่างมีประสิทธิภาพ

## ไฟล์ที่เพิ่มเข้ามา

### หน้า (Pages)
- **`apps/web/src/app/[locale]/admin/page.tsx`** - หน้า Admin Dashboard หลัก

### Components
- **`apps/web/src/components/admin/DashboardStatCard.tsx`** - Card สำหรับแสดงสถิติ
- **`apps/web/src/components/admin/PendingActionsCard.tsx`** - Card สำหรับแสดงรายการรอดำเนินการ
- **`apps/web/src/components/admin/MonthlySummaryCard.tsx`** - Card สำหรับแสดงสรุปรายเดือน
- **`apps/web/src/components/admin/AdminMenuGrid.tsx`** - Grid สำหรับเมนูการจัดการ

## ฟีเจอร์

### 1. สถิติภาพรวม (Overview Statistics)
แสดงข้อมูลสำคัญ 4 ประการ:
- **ผู้ใช้ทั้งหมด** - จำนวนผู้ใช้ทั้งหมดในระบบ
- **บริษัททั้งหมด** - จำนวนบริษัททั้งหมด
- **งานทั้งหมด** - จำนวนงานที่เผยแพร่
- **การสมัครทั้งหมด** - จำนวนการสมัครงาน

แต่ละการ์ดมี:
- ไอคอนและสีที่แตกต่างกัน
- แนวโน้ม (Trend) ในรูปแบบเปอร์เซ็นต์
- ข้อมูลที่อัปเดตจาก API

### 2. รายการรอดำเนินการ (Pending Actions)
แสดงรายการที่ต้องดำเนินการ:
- **บริษัทรอตรวจสอบ** - จำนวนบริษัทที่ยังไม่ผ่านการตรวจสอบ
- ลิงก์ไปยังหน้าตรวจสอบบริษัท

### 3. สรุปรายเดือน (Monthly Summary)
แสดงข้อมูลใหม่ของเดือนปัจจุบัน:
- ผู้ใช้ใหม่
- งานใหม่
- การสมัครใหม่

### 4. เมนูการจัดการ (Admin Menu)
ลิงก์ไปยังหน้าการจัดการต่างๆ:
- ✅ **ตรวจสอบบริษัท** - ไปยัง `/admin/companies/verify`
- 🔜 **จัดการผู้ใช้** - เร็วๆ นี้
- 🔜 **จัดการงาน** - เร็วๆ นี้

## การใช้งาน

### เข้าถึง Dashboard
1. ต้องเป็น Admin (`user.role === 'ADMIN'`)
2. ไปที่ URL: `/admin` (หรือ `/th/admin`, `/en/admin` สำหรับภาษาต่างๆ)

### API ที่ใช้
Dashboard ดึงข้อมูลจาก API endpoints ต่อไปนี้:
- `GET /api/v1/users` - ดึงข้อมูลผู้ใช้
- `GET /api/v1/companies` - ดึงข้อมูลบริษัท
- `GET /api/v1/jobs` - ดึงข้อมูลงาน
- `GET /api/v1/applications` - ดึงข้อมูลการสมัคร
- `GET /api/v1/admin/companies/pending` - ดึงข้อมูลบริษัทรอตรวจสอบ

### การจัดการข้อมูล
- ข้อมูลจะโหลดอัตโนมัติเมื่อเข้าหน้า
- หากเกิดข้อผิดพลาด จะแสดงข้อความแจ้ง และสามารถลองใหม่ได้
- ข้อมูลจะแสดงเวลาอัปเดตล่าสุด

## การปรับแต่ง

### เพิ่มการ์ดสถิติใหม่
แก้ไขไฟล์ `apps/web/src/app/[locale]/admin/page.tsx` และเพิ่มข้อมูลใน array `statCards`:

```typescript
{
  title: 'ชื่อสถิติ',
  value: 123,
  icon: <IconComponent className="w-6 h-6" />,
  color: 'text-color-600',
  bgColor: 'bg-color-50',
  trend: 10,
}
```

### เปลี่ยนสี
ใช้ TailwindCSS color classes:
- `text-blue-600`, `bg-blue-50` - สีน้ำเงิน
- `text-green-600`, `bg-green-50` - สีเขียว
- `text-purple-600`, `bg-purple-50` - สีม่วง
- `text-orange-600`, `bg-orange-50` - สีส้ม
- `text-yellow-600`, `bg-yellow-50` - สีเหลือง

## โครงสร้างไฟล์

```
apps/web/src/
├── app/[locale]/admin/
│   ├── layout.tsx (มีอยู่เดิม)
│   ├── page.tsx (Dashboard หลัก - ใหม่)
│   └── companies/verify/
│       └── page.tsx (มีอยู่เดิม)
└── components/admin/ (ใหม่)
    ├── DashboardStatCard.tsx
    ├── PendingActionsCard.tsx
    ├── MonthlySummaryCard.tsx
    └── AdminMenuGrid.tsx
```

## การพัฒนาต่อ

### ฟีเจอร์ที่สามารถเพิ่มได้
1. **กราฟสถิติ** - ใช้ Chart.js หรือ Recharts
2. **ตัวกรองวันที่** - เลือกช่วงเวลาที่ต้องการ
3. **ส่งออกรายงาน** - Export เป็น PDF/Excel
4. **การแจ้งเตือน** - Real-time notifications
5. **ประวัติกิจกรรม** - Activity log
6. **การตั้งค่า** - System settings

### API ที่ต้องเพิ่ม (สำหรับฟีเจอร์ใหม่)
```typescript
// ตัวอย่าง: ดึงข้อมูลสถิติรายวัน
GET /api/v1/admin/stats/daily?startDate=2024-01-01&endDate=2024-01-31

// ตัวอย่าง: ดึงข้อมูลกิจกรรม
GET /api/v1/admin/activity-logs?limit=20&offset=0
```

## การแก้ไขปัญหา

### Dashboard ไม่โหลดข้อมูล
1. ตรวจสอบว่า Token มีอยู่ใน localStorage
2. ตรวจสอบว่า API URL ถูกต้อง (`NEXT_PUBLIC_API_URL`)
3. ตรวจสอบ Network tab ใน DevTools

### ข้อมูลไม่อัปเดต
1. ลองรีเฟรชหน้า
2. ลองคลิกปุ่ม "ลองใหม่อีกครั้ง"
3. ตรวจสอบว่า API มีข้อมูลใหม่

## ความปลอดภัย

- ✅ ตรวจสอบ Role เป็น ADMIN เท่านั้น
- ✅ ใช้ JWT Token สำหรับ Authorization
- ✅ ข้อมูลส่วนตัวไม่แสดงในหน้า Dashboard

## หมายเหตุ

- Dashboard ใช้ `'use client'` เพราะต้องเข้าถึง localStorage และ useAuth hook
- ข้อมูลสถิติเป็นการประมาณการจากจำนวนรวม (สามารถปรับปรุงได้โดยเพิ่ม API ใหม่)
- สไตล์ใช้ TailwindCSS เพื่อให้เข้ากับ UI เดิมของ JobDD
