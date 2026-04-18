export interface Resume {
    id: string;
    userId: string;
    title: string;
    fileUrl?: string;
    summary?: string;
    experience: ResumeExperience[];
    education: ResumeEducation[];
    skills: string[];
    certifications: string[];
    isPrimary: boolean;
    createdAt: Date;
}

export interface ResumeExperience {
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
    isCurrent: boolean;
}

export interface ResumeEducation {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
}

export interface CreateResumeDto {
    title: string;
    summary?: string;
    experience?: ResumeExperience[];
    education?: ResumeEducation[];
    skills?: string[];
    certifications?: string[];
}
