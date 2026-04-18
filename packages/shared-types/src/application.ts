export enum ApplicationStatus {
    PENDING = 'PENDING',
    REVIEWED = 'REVIEWED',
    SHORTLISTED = 'SHORTLISTED',
    INTERVIEW = 'INTERVIEW',
    OFFERED = 'OFFERED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN',
}

export interface Application {
    id: string;
    jobId: string;
    userId: string;
    resumeId: string;
    coverLetter?: string;
    status: ApplicationStatus;
    appliedAt: Date;
    updatedAt: Date;
}

export interface CreateApplicationDto {
    jobId: string;
    resumeId: string;
    coverLetter?: string;
}
