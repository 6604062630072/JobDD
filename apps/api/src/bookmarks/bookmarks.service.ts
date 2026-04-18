import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
    constructor(private prisma: PrismaService) { }

    async toggleBookmark(employerId: string, candidateId: string) {
        const existing = await this.prisma.bookmark.findUnique({
            where: {
                employerId_candidateId: {
                    employerId,
                    candidateId,
                },
            },
        });

        // 2. ถ้ามีแล้ว -> ให้ลบออก (Unbookmark)
        if (existing) {
            await this.prisma.bookmark.delete({
                where: { id: existing.id },
            });
            return { status: 'unbookmarked', message: 'ลบการบันทึกแล้ว' };
        }

        // 3. ถ้ายังไม่มี -> ให้สร้างใหม่ (Bookmark)
        await this.prisma.bookmark.create({
            data: {
                employerId,
                candidateId,
            },
        });
        return { status: 'bookmarked', message: 'บันทึกเรียบร้อยแล้ว' }

    }

    async getMyBookmarks(employerId: string) {
        return this.prisma.bookmark.findMany({
            where: { employerId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        profile: true,
                        email: true,
                        jobPreferences: {
                            select: {
                                position: true,
                            },
                            orderBy: {
                                order: 'asc',
                            },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}