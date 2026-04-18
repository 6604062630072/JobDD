export enum JobType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    CONTRACT = 'CONTRACT',
    INTERNSHIP = 'INTERNSHIP',
    FREELANCE = 'FREELANCE',
}

export enum WorkModel {
    ONSITE = 'ONSITE',
    REMOTE = 'REMOTE',
    HYBRID = 'HYBRID',
}

export enum JobStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
    EXPIRED = 'EXPIRED',
}

export interface Job {
    id: string;
    companyId: string;
    title: string;
    slug: string;
    description: string;
    requirements: string;
    benefits?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryVisible: boolean;
    jobType: JobType;
    workModel: WorkModel;
    locationProvince: string;
    locationDistrict?: string;
    requiredSkills: string[];
    status: JobStatus;
    publishedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
}

export interface CreateJobDto {
    title: string;
    description: string;
    requirements: string;
    benefits?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryVisible?: boolean;
    jobType: JobType;
    workModel: WorkModel;
    locationProvince: string;
    locationDistrict?: string;
    requiredSkills: string[];
}

export interface JobSearchParams {
    q?: string;
    jobType?: JobType;
    workModel?: WorkModel;
    province?: string;
    salaryMin?: number;
    salaryMax?: number;
    skills?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'salary';
}
