import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { JwtPayload } from '../../auth/types/jwt-payload.interface';

/**
 * Extract the current user from the JWT payload attached by JwtAuthGuard.
 * Usage: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
    (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | string => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as JwtPayload;
        return data ? user[data] : user;
    },
);
