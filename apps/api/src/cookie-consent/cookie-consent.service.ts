import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CookieConsentService {
    constructor(private readonly prisma: PrismaService) { }

    async recordConsent(data: {
        consent: boolean;
        ipAddress?: string;
        userAgent?: string;
        userId?: string;
    }) {
        // We optionally take the userId, ipAddress and userAgent
        // and store it in our logging table
        return this.prisma.cookieConsentLog.create({
            data: {
                consent: data.consent,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
                userId: data.userId || null,
            },
        });
    }
}
