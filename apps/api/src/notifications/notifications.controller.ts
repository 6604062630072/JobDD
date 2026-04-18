import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.interface';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'ดึงรายการแจ้งเตือน (pagination)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async findAll(
        @CurrentUser() user: JwtPayload,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.notificationsService.findAll(user.sub, Number(page), Number(limit));
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'ดึงจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน' })
    async getUnreadCount(@CurrentUser() user: JwtPayload) {
        const count = await this.notificationsService.getUnreadCount(user.sub);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'มาร์คแจ้งเตือนว่าอ่านแล้ว' })
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        await this.notificationsService.markAsRead(id, user.sub);
        return { success: true };
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'มาร์คแจ้งเตือนทั้งหมดว่าอ่านแล้ว' })
    async markAllAsRead(@CurrentUser() user: JwtPayload) {
        await this.notificationsService.markAllAsRead(user.sub);
        return { success: true };
    }
    @Delete('read-all')
    @ApiOperation({ summary: 'ลบแจ้งเตือนทั้งหมดของผู้ใช้' })
    async deleteAll(@CurrentUser() user: JwtPayload) {
        await this.notificationsService.deleteAll(user.sub);
        return { success: true };
    }

    @Delete()
    @ApiOperation({ summary: 'ลบแจ้งเตือนแบบเลือกหลายรายการ' })
    async deleteBatch(
        @Body() body: { ids: string[] },
        @CurrentUser() user: JwtPayload,
    ) {
        if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
            return { success: false, message: 'Invalid or empty ids array' };
        }
        await this.notificationsService.deleteBatch(body.ids, user.sub);
        return { success: true };
    }
}
