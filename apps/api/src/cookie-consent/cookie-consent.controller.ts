import { Controller, Post, Body, Req } from '@nestjs/common';
import { CookieConsentService } from './cookie-consent.service';
import { Request } from 'express';
import { IsBoolean } from 'class-validator';

// Define a simple DTO to ensure we get a boolean
class CookieConsentDto {
    @IsBoolean()
    consent!: boolean;
}

@Controller('cookie-consent')
export class CookieConsentController {
    constructor(private readonly cookieConsentService: CookieConsentService) { }

    @Post()
    async logConsent(@Body() data: CookieConsentDto, @Req() req: Request) {
        // Extract IP Address
        const ipAddress =
            (req.headers['x-forwarded-for'] as string) ||
            req.socket.remoteAddress ||
            undefined;

        // Extract User Agent
        const userAgent = req.headers['user-agent'] || undefined;

        // Extract User ID if authenticated via JWT (req.user would be populated by AuthGuard)
        let userId: string | undefined = undefined;
        const anyReq = req as any;
        if (anyReq.user && anyReq.user.id) {
            userId = anyReq.user.id;
        }

        return this.cookieConsentService.recordConsent({
            consent: data.consent,
            ipAddress,
            userAgent,
            userId,
        });
    }
}
