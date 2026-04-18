import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { getRegionProvinces } from '../jobs/job-regions';

/** Salary tier breakpoints – must be sorted ascending and match frontend presets */
const SALARY_TIERS = [
    15000, 20000, 25000, 30000, 40000, 50000,
    60000, 70000, 80000, 100000, 150000, 200000, 250000,
];

/** Build a Prisma `salaryMin` range filter from the selected minimum salary */
function buildSalaryRangeFilter(salaryMin: number) {
    const nextTier = SALARY_TIERS.find(t => t > salaryMin);
    return nextTier
        ? { gte: salaryMin, lt: nextTier }
        : { gte: salaryMin };
}

export interface SearchFilters {
    jobType?: string;
    workModel?: string;
    province?: string;
    region?: string;
    salaryMin?: number;
    salaryMax?: number;
    education?: string;
    category?: string;
}

export interface SearchResult {
    data: any[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        query?: string;
    };
}

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        readonly configService: ConfigService,
        readonly prisma: PrismaService,
    ) { }

    async onModuleInit() {
        this.logger.log('🔍 Search service initialized (Prisma portable search)');
    }

    /**
     * Text search for jobs using Prisma filters so it remains portable across databases
     */
    async searchJobs(
        query?: string,
        filters?: SearchFilters,
        page = 1,
        limit = 20,
    ): Promise<SearchResult> {
        const trimmedQuery = query?.trim() || '';

        if (!trimmedQuery) {
            return this.listJobsWithFilters(filters, page, limit);
        }

        return this.likeSearch(trimmedQuery, filters, page, limit);
    }

    /**
     * Fallback LIKE-based search
     */
    private async likeSearch(
        query: string,
        filters: SearchFilters | undefined,
        page: number,
        limit: number,
    ): Promise<SearchResult> {
        const offset = (page - 1) * limit;

        const where: any = {
            status: 'ACTIVE',
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { requirements: { contains: query, mode: 'insensitive' } },
                { company: { name: { contains: query, mode: 'insensitive' } } },
            ],
        };

        if (filters?.jobType) {
            const types = filters.jobType.split(',').filter(t => t.trim());
            where.jobType = types.length === 1 ? types[0] : { in: types };
        }
        if (filters?.workModel) where.workModel = filters.workModel;
        const regionProvinces = getRegionProvinces(filters?.region);
        if (filters?.province && regionProvinces?.includes(filters.province)) where.locationProvince = filters.province;
        else if (regionProvinces?.length) where.locationProvince = { in: regionProvinces };
        else if (filters?.province) where.locationProvince = filters.province;
        if (filters?.salaryMin) where.salaryMin = buildSalaryRangeFilter(filters.salaryMin);
        if (filters?.salaryMax) where.salaryMax = { lte: filters.salaryMax };
        if (filters?.education) {
            const edus = filters.education.split(',').map(e => e.trim()).filter(Boolean);
            where.education = edus.length === 1 ? edus[0] : { in: edus };
        }
        if (filters?.category) {
            const cats = filters.category.split(',').map(c => c.trim()).filter(Boolean);
            where.category = cats.length === 1 ? cats[0] : { in: cats };
        }

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: { publishedAt: 'desc' },
                include: {
                    company: {
                        select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true, verificationStatus: true },
                    },
                    _count: { select: { savedBy: true } },
                },
            }),
            this.prisma.job.count({ where }),
        ]);

        return {
            data: jobs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                query,
            },
        };
    }

    /**
     * List jobs with filters only (no text search)
     */
    private async listJobsWithFilters(
        filters: SearchFilters | undefined,
        page: number,
        limit: number,
    ): Promise<SearchResult> {
        const skip = (page - 1) * limit;

        const where: any = { status: 'ACTIVE' };
        if (filters?.jobType) {
            const types = filters.jobType.split(',').filter(t => t.trim());
            where.jobType = types.length === 1 ? types[0] : { in: types };
        }
        if (filters?.workModel) where.workModel = filters.workModel;
        const regionProvinces = getRegionProvinces(filters?.region);
        if (filters?.province && regionProvinces?.includes(filters.province)) where.locationProvince = filters.province;
        else if (regionProvinces?.length) where.locationProvince = { in: regionProvinces };
        else if (filters?.province) where.locationProvince = filters.province;
        if (filters?.salaryMin) where.salaryMin = buildSalaryRangeFilter(filters.salaryMin);
        if (filters?.salaryMax) where.salaryMax = { lte: filters.salaryMax };
        if (filters?.education) {
            const edus = filters.education.split(',').map(e => e.trim()).filter(Boolean);
            where.education = edus.length === 1 ? edus[0] : { in: edus };
        }
        if (filters?.category) {
            const cats = filters.category.split(',').map(c => c.trim()).filter(Boolean);
            where.category = cats.length === 1 ? cats[0] : { in: cats };
        }

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: {
                        select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true, verificationStatus: true },
                    },
                    _count: { select: { savedBy: true } },
                },
            }),
            this.prisma.job.count({ where }),
        ]);

        return {
            data: jobs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
