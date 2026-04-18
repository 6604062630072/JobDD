export enum UserRole {
    JOBSEEKER = 'JOBSEEKER',
    EMPLOYER = 'EMPLOYER',
    ADMIN = 'ADMIN',
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserDto {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone?: string;
}
