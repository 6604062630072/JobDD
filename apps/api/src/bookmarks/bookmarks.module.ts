import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    // รวม Module ทั้งหมดไว้ใน [ ] เดียวกัน
    imports: [PrismaModule, AuthModule],
    controllers: [BookmarksController],
    providers: [BookmarksService],
})
export class BookmarksModule { }