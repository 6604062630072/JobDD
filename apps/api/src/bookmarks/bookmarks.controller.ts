import { Controller, Post, Get, Param, Request, UseGuards } from '@nestjs/common'; // เพิ่ม UseGuards ตรงนี้
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookmarks')
export class BookmarksController {
    constructor(private readonly bookmarksService: BookmarksService) { }

    @UseGuards(JwtAuthGuard) // ทำงานได้แล้วเพราะ import UseGuards มาแล้ว
    @Post('toggle/:candidateId')
    async toggleBookmark(
        @Request() req,
        @Param('candidateId') candidateId: string,
    ) {
        // ถ้า JwtAuthGuard ทำงาน req.user จะไม่เป็น undefined
        const employerId = req.user.id;
        return this.bookmarksService.toggleBookmark(employerId, candidateId);
    }

    @UseGuards(JwtAuthGuard) // ต้องใส่ Guard ที่นี่ด้วย เพราะมีการใช้ req.user.id
    @Get('my-list')
    async getMyBookmarks(@Request() req) {
        const employerId = req.user.id;
        return this.bookmarksService.getMyBookmarks(employerId);
    }
}