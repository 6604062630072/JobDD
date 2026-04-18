import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) {
            return true;
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            // Attach user payload to request for downstream use
            (request as any).user = payload;
        } catch {
            // If token is invalid, we still allow access but without the user object
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
