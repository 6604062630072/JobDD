import { z } from 'zod';

export const createJobSchema = z.object({
    title: z.string().min(5, 'ชื่อตำแหน่งต้องมีอย่างน้อย 5 ตัวอักษร').max(200),
    description: z.string().min(50, 'รายละเอียดงานต้องมีอย่างน้อย 50 ตัวอักษร'),
    requirements: z.string().min(20, 'คุณสมบัติต้องมีอย่างน้อย 20 ตัวอักษร'),
    benefits: z.string().optional(),
    salaryMin: z.number().positive().optional(),
    salaryMax: z.number().positive().optional(),
    salaryVisible: z.boolean().default(true),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
    workModel: z.enum(['ONSITE', 'REMOTE', 'HYBRID']),
    locationProvince: z.string().min(1, 'กรุณาระบุจังหวัด'),
    locationDistrict: z.string().optional(),
    requiredSkills: z.array(z.string()).min(1, 'กรุณาระบุทักษะอย่างน้อย 1 รายการ'),
});

export const jobSearchSchema = z.object({
    q: z.string().optional(),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).optional(),
    workModel: z.enum(['ONSITE', 'REMOTE', 'HYBRID']).optional(),
    province: z.string().optional(),
    salaryMin: z.coerce.number().positive().optional(),
    salaryMax: z.coerce.number().positive().optional(),
    skills: z.array(z.string()).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['relevance', 'date', 'salary']).default('relevance'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type JobSearchInput = z.infer<typeof jobSearchSchema>;
