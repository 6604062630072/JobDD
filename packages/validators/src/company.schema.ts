import { z } from 'zod';

export const createCompanySchema = z.object({
    name: z.string().min(2, 'ชื่อบริษัทต้องมีอย่างน้อย 2 ตัวอักษร').max(200),
    description: z.string().optional(),
    website: z.string().url('URL เว็บไซต์ไม่ถูกต้อง').optional().or(z.literal('')),
    industry: z.string().optional(),
    size: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
