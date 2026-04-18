import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from './types/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly config: ConfigService,
    ) { }

    @Post('register')
    @ApiOperation({ summary: 'สมัครสมาชิก' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'เข้าสู่ระบบ' })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'ดูข้อมูลโปรไฟล์ (ต้อง login)' })
    async getProfile(@CurrentUser() user: JwtPayload) {
        return this.authService.getProfile(user);
    }

    // ─── Google OAuth ─────────────────────────────────────────
    @Get('google')
    @ApiOperation({ summary: 'เริ่ม Google OAuth' })
    googleLogin(@Res() res: Response) {
        res.redirect(this.authService.getGoogleRedirectUrl());
    }

    @Get('google/callback')
    @ApiExcludeEndpoint()
    async googleCallback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response) {
        const frontendUrl = this.config.get<string>('NEXTAUTH_URL', 'http://localhost:3000');
        if (error || !code) {
            return res.redirect(`${frontendUrl}/th/login?error=google_cancelled`);
        }
        try {
            const { token, user } = await this.authService.handleGoogleCallback(code);
            const params = new URLSearchParams({ token, user: JSON.stringify(user) });
            return res.redirect(`${frontendUrl}/th/auth/callback?${params.toString()}`);
        } catch {
            return res.redirect(`${frontendUrl}/th/login?error=google_failed`);
        }
    }

}
