import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminCompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingCompanies(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where: { verificationStatus: VerificationStatus.PENDING_REVIEW },
        include: {
          owner: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, // Order by oldest first
      }),
      this.prisma.company.count({
        where: { verificationStatus: VerificationStatus.PENDING_REVIEW },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifyCompany(id: string, status: 'VERIFIED' | 'REJECTED', rejectionReason?: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('ไม่พบข้อมูลบริษัท');

    return this.prisma.company.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus[status],
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        isVerified: status === 'VERIFIED',
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
      },
    });
  }
}
