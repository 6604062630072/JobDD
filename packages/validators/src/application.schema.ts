import { z } from 'zod';

export const createApplicationSchema = z.object({
    jobId: z.string().uuid('Job ID ไม่ถูกต้อง'),
    resumeId: z.string().uuid('Resume ID ไม่ถูกต้อง'),
    coverLetter: z.string().max(5000).optional(),
});

export const updateApplicationStatusSchema = z.object({
    status: z.enum([
        'PENDING',
        'REVIEWED',
        'SHORTLISTED',
        'INTERVIEW',
        'OFFERED',
        'REJECTED',
        'WITHDRAWN',
    ]),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
