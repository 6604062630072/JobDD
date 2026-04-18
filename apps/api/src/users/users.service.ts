import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpsertEducationDto } from './dto/upsert-education.dto';
import { UpsertWorkHistoryDto } from './dto/upsert-work-history.dto';
import { UpsertLanguagesDto } from './dto/upsert-languages.dto';
import { UpsertCertificatesDto } from './dto/upsert-certificates.dto';

@Injectable()
export class UsersService {
    constructor(
        readonly prisma: PrismaService,
        readonly uploadService: UploadService,
    ) { }

    // ===================================
    // Profile (Personal Info)
    // ===================================
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                avatarUrl: true,
                profile: true,
            },
        });

        if (!user) return null;

        // Flatten profile into user object to match frontend expectations
        const { profile, ...userData } = user;
        return {
            ...userData,
            ...(profile || {}),
            isPublic: profile?.isPublic ?? true,
        };
    }

    async upsertProfile(userId: string, dto: UpdateProfileDto) {
        // Verify user exists first to prevent FK constraint error
        const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            throw new NotFoundException('ไม่พบผู้ใช้ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่');
        }

        const data: any = {
            gender: dto.gender,
            phone: dto.phone,
            lineId: dto.lineId,
            nationality: dto.nationality,
            maritalStatus: dto.maritalStatus,
            militaryStatus: dto.militaryStatus,
            address: dto.address,
            province: dto.province,
            district: dto.district,
            subDistrict: dto.subDistrict,
            postalCode: dto.postalCode,
        };

        if (dto.isPublic !== undefined) {
            data.isPublic = dto.isPublic;
        }

        if (dto.birthDate) {
            data.birthDate = new Date(dto.birthDate);
        }
        if (dto.height !== undefined && dto.height !== null) {
            data.height = dto.height;
        }
        if (dto.weight !== undefined && dto.weight !== null) {
            data.weight = dto.weight;
        }

        const profile = await this.prisma.userProfile.upsert({
            where: { userId },
            create: { userId, ...data },
            update: data,
        });
        return profile;
    }

    // ===================================
    // Education
    // ===================================
    async getEducations(userId: string) {
        return this.prisma.education.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async upsertEducations(userId: string, dto: UpsertEducationDto) {
        console.log('Service: upsertEducations called for user', userId);
        console.log('Service: payload', JSON.stringify(dto));

        try {
            const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!userExists) {
                console.error('Service: User not found', userId);
                throw new NotFoundException('ไม่พบผู้ใช้ กรุณา Login ใหม่');
            }

            if (!dto.items || !Array.isArray(dto.items)) {
                console.warn('Service: Items is not an array or undefined', dto.items);
                // Return empty or throw bad request? Let's just return empty for now to avoid 500
                return [];
            }

            // Replace all: delete existing then create new
            await this.prisma.education.deleteMany({ where: { userId } });

            if (dto.items.length === 0) return [];

            // Filter out items without institution name
            const validItems = dto.items.filter(item => item.institution && item.institution.trim() !== '');

            if (validItems.length === 0) return [];

            const created = await Promise.all(
                validItems.map((item) => {
                    // Sanitize numeric fields to prevent NaN/invalid values reaching Prisma
                    const graduationYear = (item.graduationYear != null && !isNaN(Number(item.graduationYear)))
                        ? Math.round(Number(item.graduationYear))
                        : null;
                    const gpa = (item.gpa != null && !isNaN(Number(item.gpa)))
                        ? Number(item.gpa)
                        : null;

                    return this.prisma.education.create({
                        data: {
                            userId,
                            institution: item.institution,
                            faculty: item.faculty || null,
                            major: item.major || null,
                            educationLevel: item.educationLevel || null,
                            degreeName: item.degreeName || null,
                            graduationYear,
                            gpa,
                            hasHonors: item.hasHonors ?? false,
                        },
                    });
                }),
            );
            return created;
        } catch (error: any) {
            console.error('Service: upsertEducations Error DETAILS:', JSON.stringify(error, null, 2));
            console.error('Service: upsertEducations Error Message:', error?.message);
            console.error('Service: upsertEducations Error Stack:', error?.stack);
            console.error('Service: upsertEducations Error Code:', error?.code);
            throw error; // Re-throw to be handled by global filter
        }
    }

    // ===================================
    // Work History
    // ===================================
    async getWorkHistories(userId: string) {
        return this.prisma.workHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async upsertWorkHistories(userId: string, dto: UpsertWorkHistoryDto) {
        try {
            const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!userExists) throw new NotFoundException('ไม่พบผู้ใช้ กรุณา Login ใหม่');

            if (!dto.items || !Array.isArray(dto.items)) return [];

            // Filter
            const validItems = dto.items.filter(item => item.company && item.company.trim() !== '');

            await this.prisma.workHistory.deleteMany({ where: { userId } });

            if (validItems.length === 0) return [];

            const created = await Promise.all(
                validItems.map((item) =>
                    this.prisma.workHistory.create({
                        data: {
                            userId,
                            company: item.company,
                            businessType: item.businessType,
                            position: item.position,
                            jobType: item.jobType,
                            startMonth: item.startMonth,
                            startYear: item.startYear,
                            endMonth: item.endMonth,
                            endYear: item.endYear,
                            isCurrent: item.isCurrent ?? false,
                        },
                    }),
                ),
            );
            return created;
        } catch (error) {
            console.error('Service: upsertWorkHistories Error', error);
            throw error;
        }
    }

    // ===================================
    // Languages + Tests
    // ===================================
    async getLanguages(userId: string) {
        const [languages, tests] = await Promise.all([
            this.prisma.userLanguage.findMany({
                where: { userId },
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.languageTest.findMany({
                where: { userId },
                orderBy: { createdAt: 'asc' },
            }),
        ]);
        return { languages, tests };
    }

    async upsertLanguages(userId: string, dto: UpsertLanguagesDto) {
        try {
            const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!userExists) throw new NotFoundException('ไม่พบผู้ใช้ กรุณา Login ใหม่');

            const validLangs = (dto.languages || []).filter(l => l.language && l.language.trim() !== '');
            const validTests = (dto.tests || []).filter(t => t.testName && t.testName.trim() !== '');

            await Promise.all([
                this.prisma.userLanguage.deleteMany({ where: { userId } }),
                this.prisma.languageTest.deleteMany({ where: { userId } }),
            ]);

            const [languages, tests] = await Promise.all([
                validLangs.length > 0 ? Promise.all(
                    validLangs.map((item) =>
                        this.prisma.userLanguage.create({
                            data: {
                                userId,
                                language: item.language,
                                level: item.level || null,
                                speaking: item.speaking || null,
                                reading: item.reading || null,
                                writing: item.writing || null,
                            },
                        }),
                    ),
                ) : [],
                validTests.length > 0 ? Promise.all(
                    validTests.map((item) =>
                        this.prisma.languageTest.create({
                            data: {
                                userId,
                                testName: item.testName,
                                score: item.score,
                                fileUrl: item.fileUrl || null,
                            },
                        }),
                    ),
                ) : [],
            ]);

            return { languages, tests };
        } catch (error) {
            console.error('Service: upsertLanguages Error', error);
            throw error;
        }
    }

    // ===================================
    // Certificates
    // ===================================
    async getCertificates(userId: string) {
        return this.prisma.certificate.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async upsertCertificates(userId: string, dto: UpsertCertificatesDto) {
        try {
            const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!userExists) throw new NotFoundException('ไม่พบผู้ใช้ กรุณา Login ใหม่');

            if (!dto.items || !Array.isArray(dto.items)) return [];

            const validItems = dto.items.filter(item => item.name && item.name.trim() !== '');

            await this.prisma.certificate.deleteMany({ where: { userId } });

            if (validItems.length === 0) return [];

            const created = await Promise.all(
                validItems.map((item) =>
                    this.prisma.certificate.create({
                        data: {
                            userId,
                            name: item.name,
                            issuedBy: item.issuedBy,
                            issueYear: item.issueYear,
                            imageUrl: item.imageUrl,
                        },
                    }),
                ),
            );
            return created;
        } catch (error) {
            console.error('Service: upsertCertificates Error', error);
            throw error;
        }
    }

    // ===================================
    // Avatar Upload
    // ===================================
    async uploadAvatar(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new NotFoundException('ไม่พบไฟล์รูปภาพ');
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('ไม่พบผู้ใช้');
        }

        const oldAvatarUrl = user.avatarUrl;
        const uploadResult = await this.uploadService.uploadFile({
            file,
            folder: 'avatars',
            prefix: 'avatar',
            ownerId: userId,
        });
        const avatarUrl = uploadResult.url;

        await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
        });

        if (oldAvatarUrl) {
            try {
                await this.uploadService.deleteFileByUrl(oldAvatarUrl);
            } catch (err) {
                console.error('Failed to delete old avatar:', err);
            }
        }

        return { avatarUrl };
    }

    // ===================================
    // Job Preference (Desired Job)
    // ===================================
    async getJobPreferences(userId: string) {
        return this.prisma.jobPreference.findMany({
            where: { userId },
            orderBy: { order: 'asc' },
        });
    }

    async upsertJobPreferences(userId: string, items: { position: string }[]) {
        try {
            const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!userExists) throw new NotFoundException('ไม่พบผู้ใช้ กรุณา Login ใหม่');

            // Filter
            const validItems = items.filter(item => item.position && item.position.trim() !== '');

            await this.prisma.jobPreference.deleteMany({ where: { userId } });

            if (validItems.length === 0) return [];

            const created = await Promise.all(
                validItems.map((item, index) =>
                    this.prisma.jobPreference.create({
                        data: {
                            userId,
                            position: item.position,
                            order: index,
                        },
                    }),
                ),
            );
            return created;
        } catch (error) {
            console.error('Service: upsertJobPreferences Error', error);
            throw error;
        }
    }

    // ===================================
    // Candidate Directory
    // ===================================
    async getCandidateDirectory(filters: {

        query?: string;
        province?: string;
        gender?: string;
        ageMin?: string;
        ageMax?: string;
        skills?: string;
        educationLevel?: string;
        minGpa?: string;
        institution?: string;
        englishLevel?: string;
        businessType?: string;
        currentUserId?: string;
    }) {
        const { currentUserId, ...otherFilters } = filters;
        const users = await this.prisma.user.findMany({
            where: {
                role: 'JOBSEEKER',
                profile: {
                    isPublic: true,
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                profile: true,
                resumes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                educations: {
                    orderBy: [{ graduationYear: 'desc' }, { createdAt: 'desc' }],
                },
                workHistories: {
                    orderBy: { createdAt: 'desc' },
                },
                languages: {
                    orderBy: { createdAt: 'desc' },
                },
                languageTests: {
                    orderBy: { createdAt: 'desc' },
                },
                jobPreferences: {
                    orderBy: { order: 'asc' },
                },
                bookmarks: currentUserId ? {
                    where: {
                        employerId: currentUserId
                    },
                    select: { id: true }
                } : undefined,
            },
        });


        return users
            .map((user) => {
                const summary = this.mapCandidateSummary(user);
                const isBookmarked = !!(user as any).bookmarks?.length;
                return {
                    ...summary,
                    isBookmarked
                };
            })
            .filter((candidate) => this.matchesCandidateFilters(candidate, otherFilters))
            .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    async getCandidateDirectoryDetail(candidateId: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: candidateId,
                role: 'JOBSEEKER',
                profile: {
                    isPublic: true,
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                profile: true,
                resumes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                educations: {
                    orderBy: [{ graduationYear: 'desc' }, { createdAt: 'desc' }],
                },
                workHistories: {
                    orderBy: { createdAt: 'desc' },
                },
                languages: {
                    orderBy: { createdAt: 'desc' },
                },
                languageTests: {
                    orderBy: { createdAt: 'desc' },
                },
                jobPreferences: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('ไม่พบข้อมูลผู้หางาน');
        }

        return this.mapCandidateDetail(user);
    }

    async getCandidateContact(candidateId: string, requester: { sub: string; role: string }) {
        if (requester.role !== 'EMPLOYER') {
            throw new ForbiddenException('เฉพาะบัญชีนายจ้างเท่านั้นที่สามารถดูข้อมูลติดต่อได้');
        }

        const user = await this.prisma.user.findFirst({
            where: {
                id: candidateId,
                role: 'JOBSEEKER',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profile: {
                    select: {
                        phone: true,
                        lineId: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('ไม่พบข้อมูลผู้หางาน');
        }

        return {
            id: user.id,
            fullName: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email || '-',
            phone: user.profile?.phone || user.phone || '-',
            lineId: user.profile?.lineId || '-',
        };
    }

    private mapCandidateSummary(user: any) {
        const primaryResume = user.resumes?.[0] || null;
        const highestEducation = this.getHighestEducation(user.educations || []);
        const latestWork = this.getLatestWorkHistory(user.workHistories || []);
        const skills = this.getCandidateSkills(user, primaryResume);
        const age = this.calculateAge(user.profile?.birthDate);
        const english = this.getEnglishLevelSummary(user.languages || [], user.languageTests || []);
        const allBusinessTypes = (user.workHistories || []).map((w: any) => w.businessType).filter(Boolean);

        const preferences = user.jobPreferences || [];
        const desiredPosition = preferences.length > 0
            ? preferences.map((p: any) => p.position).join(', ')
            : (latestWork?.position || primaryResume?.title || 'ผู้หางาน');

        const expectedSalaryText = this.extractExpectedSalaryText(primaryResume?.summary);
        const fullName = `${user.firstName} ${user.lastName}`.trim();

        return {
            id: user.id,
            fullName,
            gender: user.profile?.gender || 'ไม่ระบุ',
            age,
            desiredPosition,
            expectedSalaryText,
            educationLevel: highestEducation?.educationLevel || highestEducation?.degreeName || 'ไม่ระบุ',
            major: highestEducation?.major || highestEducation?.faculty || 'ไม่ระบุ',
            province: user.profile?.province || 'ไม่ระบุ',
            postedAt: (primaryResume?.createdAt || user.updatedAt || user.createdAt).toISOString(),
            skills,
            institution: highestEducation?.institution || 'ไม่ระบุ',
            gpa: highestEducation?.gpa ?? null,
            englishLevelLabel: english.label,
            englishLevelScore: english.score,
            candidateType: 'ผู้หางาน',
            avatarUrl: user.avatarUrl || null,
            businessTypes: allBusinessTypes,
        };
    }

    private mapCandidateDetail(user: any) {
        const summary = this.mapCandidateSummary(user);
        const english = this.getEnglishLevelSummary(user.languages || [], user.languageTests || []);

        return {
            ...summary,
            nationality: user.profile?.nationality || 'ไม่ระบุ',
            religion: '-',
            workProvince: user.profile?.province || 'ไม่ระบุ',
            educationHistory: (user.educations || []).map((education: any) => ({
                id: education.id,
                educationLevel: education.educationLevel || '-',
                degreeName: education.degreeName || '-',
                major: education.major || '-',
                faculty: education.faculty || '-',
                institution: education.institution || '-',
                graduationYear: education.graduationYear || '-',
                gpa: education.gpa ?? null,
            })),
            workHistory: (user.workHistories || []).map((work: any) => ({
                id: work.id,
                position: work.position || '-',
                company: work.company || '-',
                businessType: work.businessType || '-',
                startMonth: work.startMonth || '-',
                startYear: work.startYear || '-',
                endMonth: work.endMonth || '-',
                endYear: work.endYear || '-',
                isCurrent: !!work.isCurrent,
            })),
            englishLevelLabel: english.label,
            englishStars: english.stars,
            englishDetails: english.details,
            resumeFileUrl: user.resumes?.[0]?.fileUrl || null,
        };
    }


    private matchesCandidateFilters(candidate: any, filters: {

        query?: string;
        province?: string;
        gender?: string;
        ageMin?: string;
        ageMax?: string;
        skills?: string;
        educationLevel?: string;
        minGpa?: string;
        institution?: string;
        englishLevel?: string;
        businessType?: string;
    }) {
        const query = this.normalizeText(filters.query);
        const province = this.normalizeText(filters.province);
        const gender = this.normalizeText(filters.gender);
        const educationLevel = this.normalizeText(filters.educationLevel);
        const institution = this.normalizeText(filters.institution);
        const englishLevel = this.normalizeText(filters.englishLevel);
        const businessType = this.normalizeText(filters.businessType);
        const workBusinessTypes = (candidate.businessTypes || []).join(' ');
        const ageMin = Number(filters.ageMin);
        const ageMax = Number(filters.ageMax);
        const minGpa = Number(filters.minGpa);
        const skillKeywords = (filters.skills || '')
            .split(',')
            .map((item) => this.normalizeText(item))
            .filter(Boolean);

        const searchableText = this.normalizeText([
            candidate.fullName,
            candidate.desiredPosition,
            candidate.major,
            candidate.educationLevel,
            candidate.province,
            candidate.institution,
            workBusinessTypes,
            ...(candidate.skills || []),
        ].join(' '));

        if (query && !searchableText.includes(query)) return false;
        if (businessType) {
            const hasMatchingBusiness = (candidate.workHistory || []).some((work: any) =>
                this.normalizeText(work.businessType).includes(businessType)
            );
            if (!hasMatchingBusiness) return false;
        }
        if (province && !this.normalizeText(candidate.province).includes(province)) return false;
        if (gender && !this.normalizeText(candidate.gender).includes(gender)) return false;
        if (!Number.isNaN(ageMin) && ageMin > 0 && (candidate.age == null || candidate.age < ageMin)) return false;
        if (!Number.isNaN(ageMax) && ageMax > 0 && (candidate.age == null || candidate.age > ageMax)) return false;

        if (skillKeywords.length > 0) {
            const normalizedSkills = (candidate.skills || []).map((skill: string) => this.normalizeText(skill));
            const hasMatchingSkill = skillKeywords.some((keyword) => normalizedSkills.some((skill: string) => skill.includes(keyword)));
            if (!hasMatchingSkill) return false;
        }

        if (educationLevel && !this.normalizeText(candidate.educationLevel).includes(educationLevel)) return false;
        if (!Number.isNaN(minGpa) && minGpa > 0 && (candidate.gpa == null || Number(candidate.gpa) < minGpa)) return false;
        if (institution && !this.normalizeText(candidate.institution).includes(institution)) return false;

        if (englishLevel) {
            const requiredScore = this.mapEnglishLevelFilterToScore(englishLevel);
            if (candidate.englishLevelScore < requiredScore) return false;
        }

        return true;
    }

    private calculateAge(birthDate?: Date | null) {
        if (!birthDate) return null;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age -= 1;
        }

        return age;
    }

    private getHighestEducation(educations: any[]) {
        const rankMap: Record<string, number> = {
            ประถมศึกษา: 1,
            มัธยมศึกษา: 2,
            ปวช: 3,
            ปวส: 4,
            อนุปริญญา: 5,
            ปริญญาตรี: 6,
            ปริญญาโท: 7,
            ปริญญาเอก: 8,
        };

        return [...educations].sort((a, b) => {
            const rankA = rankMap[a.educationLevel || ''] || 0;
            const rankB = rankMap[b.educationLevel || ''] || 0;
            if (rankA !== rankB) return rankB - rankA;
            return Number(b.graduationYear || 0) - Number(a.graduationYear || 0);
        })[0] || null;
    }

    private getLatestWorkHistory(workHistories: any[]) {
        const currentWork = workHistories.find((work) => work.isCurrent);
        if (currentWork) return currentWork;
        return workHistories[0] || null;
    }

    private getCandidateSkills(user: any, primaryResume: any) {
        const resumeSkills = Array.isArray(primaryResume?.skills)
            ? primaryResume.skills.filter((skill: unknown) => typeof skill === 'string')
            : [];
        const workSkills = (user.workHistories || []).map((work: any) => work.position).filter(Boolean);
        const languageSkills = (user.languages || []).map((language: any) => language.language).filter(Boolean);
        const educationSkills = (user.educations || []).flatMap((education: any) => [education.major, education.faculty]).filter(Boolean);

        return Array.from(new Set([...resumeSkills, ...workSkills, ...languageSkills, ...educationSkills])).slice(0, 12);
    }

    private extractExpectedSalaryText(summary?: string | null) {
        if (!summary) return 'ไม่ระบุ';

        const rangeMatch = summary.match(/(\d{4,6})\s*[-–]\s*(\d{4,6})/);
        if (rangeMatch) {
            return `${Number(rangeMatch[1]).toLocaleString()}-${Number(rangeMatch[2]).toLocaleString()} บาท`;
        }

        const singleMatch = summary.match(/(\d{4,6})/);
        if (singleMatch) {
            return `${Number(singleMatch[1]).toLocaleString()} บาท`;
        }

        return 'ไม่ระบุ';
    }

    private getEnglishLevelSummary(languages: any[], tests: any[]) {
        const englishLanguage = languages.find((language) => {
            const normalized = this.normalizeText(language.language);
            return normalized.includes('english') || normalized.includes('อังกฤษ');
        });

        const details = [englishLanguage?.level, englishLanguage?.speaking, englishLanguage?.reading, englishLanguage?.writing]
            .filter(Boolean)
            .join(' / ');
        const score = this.mapEnglishTextToScore(details || tests.map((test) => test.testName).join(' '));

        return {
            score,
            stars: score,
            label: this.mapEnglishScoreToLabel(score),
            details: details || 'ไม่ระบุ',
        };
    }

    private mapEnglishTextToScore(value?: string) {
        const normalized = this.normalizeText(value);

        if (!normalized) return 0;
        if (normalized.includes('excellent') || normalized.includes('ยอดเยี่ยม') || normalized.includes('ดีมาก')) return 5;
        if (normalized.includes('very good') || normalized.includes('good') || normalized.includes('ดี')) return 4;
        if (normalized.includes('fair') || normalized.includes('พอใช้') || normalized.includes('ปานกลาง')) return 3;
        if (normalized.includes('basic') || normalized.includes('เล็กน้อย') || normalized.includes('พื้นฐาน')) return 2;
        return 1;
    }

    private mapEnglishScoreToLabel(score: number) {
        if (score >= 5) return 'ดีมาก';
        if (score >= 4) return 'ดี';
        if (score >= 3) return 'พอใช้';
        if (score >= 2) return 'พื้นฐาน';
        return 'ไม่ระบุ';
    }

    private mapEnglishLevelFilterToScore(value: string) {
        const normalized = this.normalizeText(value);
        if (!normalized) return 0;
        if (normalized.includes('ดีมาก')) return 5;
        if (normalized.includes('ดี')) return 4;
        if (normalized.includes('พอใช้')) return 3;
        if (normalized.includes('พื้นฐาน')) return 2;
        return 1;
    }

    private normalizeText(value?: string | null) {
        return (value || '').trim().toLowerCase();
    }

    // ===================================
    // Helpers
    // ===================================
    async findById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
}
