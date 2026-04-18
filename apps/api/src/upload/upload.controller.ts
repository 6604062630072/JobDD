import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
    constructor(readonly uploadService: UploadService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (
                _req: Express.Request,
                file: Express.Multer.File,
                cb: (error: Error | null, acceptFile: boolean) => void,
            ) => {
                const allowed = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowed.includes(file.mimetype)) {
                    return cb(new BadRequestException('รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น'), false);
                }
                cb(null, true);
            },
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('ไม่พบไฟล์ที่อัพโหลด');
        return this.uploadService.uploadFile({
            file,
            folder: 'images',
            prefix: 'image',
        });
    }

    @Post('document')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
            fileFilter: (
                _req: Express.Request,
                file: Express.Multer.File,
                cb: (error: Error | null, acceptFile: boolean) => void,
            ) => {
                const allowed = ['application/pdf'];
                if (!allowed.includes(file.mimetype)) {
                    return cb(new BadRequestException('รองรับเฉพาะไฟล์ PDF เท่านั้น'), false);
                }
                cb(null, true);
            },
        }),
    )
    async uploadDocument(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('ไม่พบไฟล์ที่อัพโหลด');
        return this.uploadService.uploadFile({
            file,
            folder: 'documents',
            prefix: 'doc',
        });
    }
}
