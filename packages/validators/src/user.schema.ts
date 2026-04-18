import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    password: z
        .string()
        .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        .regex(/[A-Z]/, 'ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว')
        .regex(/[0-9]/, 'ต้องมีตัวเลขอย่างน้อย 1 ตัว'),
    firstName: z.string().min(1, 'กรุณาระบุชื่อ'),
    lastName: z.string().min(1, 'กรุณาระบุนามสกุล'),
    role: z.enum(['JOBSEEKER', 'EMPLOYER']),
    phone: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

export const updateProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
