import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) { }


    async canActivate(context: ExecutionContext): Promise<boolean> {

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('กรุณาเข้าสู่ระบบ');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            // Attach user payload to request for downstream use
            (request as any).user = {
                ...payload,
                id: payload.sub
            };
        } catch {
            throw new UnauthorizedException('Token ไม่ถูกต้องหรือหมดอายุ');
        }

        return true;
    }

    private extractToken(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) return undefined;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}
