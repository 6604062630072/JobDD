import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    async create(createApplicationDto: CreateApplicationDto, userId: string) {
        const { jobId, resumeId } = createApplicationDto;

        // Check if job exists and is active
        const job = await this.prisma.job.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        if ((job.status as any) !== 'ACTIVE') {
            throw new BadRequestException('This job is not currently open for applications');
        }

        // Check if already applied
        const existingApplication = await this.prisma.application.findUnique({
            where: {
                jobId_userId: {
                    jobId,
                    userId
                }
            }
        });

        if (existingApplication) {
            throw new BadRequestException('You have already applied for this job');
        }

        // Verify user exists in DB (token may outlive the user record)
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!userExists) {
            throw new NotFoundException('User not found. Please log in again.');
        }

        // Handle Resume
        let finalResumeId = resumeId;
        if (!finalResumeId) {
            // Find existing resume or create a default one
            const primaryResume = await this.prisma.resume.findFirst({
                where: { userId, isPrimary: true }
            });

            if (primaryResume) {
                finalResumeId = primaryResume.id;
            } else {
                const anyResume = await this.prisma.resume.findFirst({
                    where: { userId }
                });

                if (anyResume) {
                    finalResumeId = anyResume.id;
                } else {
                    // Create minimal default resume
                    const newResume = await this.prisma.resume.create({
                        data: {
                            userId,
                            title: 'Default Resume',
                            isPrimary: true,
                        }
                    });
                    finalResumeId = newResume.id;
                }
            }
        }

        // Create application
        return this.prisma.application.create({
            data: {
                jobId,
                userId,
                resumeId: finalResumeId,
                status: 'PENDING'
            }
        });
    }

    async findRecentForEmployer(employerId: string, limit: number = 5) {
        return this.prisma.application.findMany({
            where: {
                job: {
                    company: {
                        ownerId: employerId
                    }
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                appliedAt: 'desc'
            },
            take: limit
        });
    }

    async findAllForEmployer(employerId: string, jobId?: string) {
        const where: any = {
            job: {
                company: {
                    ownerId: employerId
                }
            }
        };
        if (jobId) {
            where.jobId = jobId;
        }
        return this.prisma.application.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                appliedAt: 'desc'
            },
        });
    }

    async verifyJobOwnership(jobId: string, employerId: string): Promise<boolean> {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { company: true },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        return job.company.ownerId === employerId;
    }

    async verifyApplicationOwnership(applicationId: string, employerId: string): Promise<boolean> {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: { include: { company: true } } },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return application.job.company.ownerId === employerId;
    }

    async findOne(id: string) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatarUrl: true,
                        profile: true,
                        educations: true,
                        workHistories: true,
                        languages: true,
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                resume: true
            }
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return application;
    }

    async findByJobId(jobId: string) {
        return this.prisma.application.findMany({
            where: { jobId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatarUrl: true,
                    }
                },
                resume: true,
            },
            orderBy: {
                appliedAt: 'desc',
            },
        });
    }

    async updateStatus(id: string, status: ApplicationStatus) {
        const updated = await this.prisma.application.update({
            where: { id },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        company: {
                            select: { name: true },
                        },
                    }
                },
            }
        });

        // Fire-and-forget notification
        this.notificationsService.createForStatusChange(
            updated.user.id,
            status,
            updated.job.title,
            updated.job.company.name,
            updated.job.slug,
            updated.id,
        ).catch(() => { });

        return updated;
    }

    async scheduleInterview(id: string, interviewDate: Date) {
        const updated = await this.prisma.application.update({
            where: { id },
            data: {
                interviewDate,
                status: 'INTERVIEW',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        company: {
                            select: { name: true },
                        },
                    }
                },
            }
        });

        // Fire-and-forget notification
        this.notificationsService.createForInterview(
            updated.user.id,
            updated.job.title,
            updated.job.company.name,
            updated.job.slug,
            updated.id,
            interviewDate,
        ).catch(() => { });

        return updated;
    }

    async findInterviewsForEmployer(employerId: string) {
        return this.prisma.application.findMany({
            where: {
                status: 'INTERVIEW', // Only show active interviews
                interviewDate: { not: null },
                job: {
                    company: {
                        ownerId: employerId,
                    },
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                    }
                },
            },
            orderBy: {
                interviewDate: 'asc',
            },
        });
    }

    async findMyApplications(userId: string) {
        return this.prisma.application.findMany({
            where: { userId },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        locationProvince: true,
                        locationDistrict: true,
                        companyAddress: true,
                        workModel: true,
                        jobType: true,
                        company: {
                            select: {
                                name: true,
                                logoUrl: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                appliedAt: 'desc'
            }
        });
    }

    async cancelInterview(id: string) {
        return this.prisma.application.update({
            where: { id },
            data: {
                interviewDate: null,
                status: 'SHORTLISTED',
            },
        });
    }
}
