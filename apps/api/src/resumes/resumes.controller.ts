import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ResumesService } from './resumes.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetMetadata } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Query } from '@nestjs/common';

@ApiTags('resumes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resumes')
export class ResumesController {
    constructor(readonly resumesService: ResumesService) { }

    @Post('parse')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    async parse(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ],
            }),
        ) file: Express.Multer.File,
    ) {
        return this.resumesService.parseResume(file);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    async upload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB for resumes
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ],
            }),
        ) file: Express.Multer.File,
        @Request() req: any,
    ) {
        return this.resumesService.uploadFile(req.user.sub, file);
    }

    @Public()
    @Get()
    async findAll(
        @Query('categoryId') categoryId?: string, // 🚩 ระบุชื่อ query parameter ชัดเจน
        @Query('search') search?: string
    ) {
        console.log('API Hit with categoryId:', categoryId); // ลองดูใน Terminal ว่า tech โผล่มาไหม
        return this.resumesService.findAll({ categoryId, search });
    }

    @Public()
    @Get('homepage-categories')
    @SetMetadata('isPublic', true) // หรือ @Public() ขึ้นอยู่กับว่าคุณเซ็ตระบบไว้ยังไง
    async getHomepageCategories() {
        return this.resumesService.getHomepageCategories();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.resumesService.findById(id);
    }

    @Post(':id/analyze')
    async analyze(@Param('id') id: string, @Request() req: any) {
        return this.resumesService.parseStoredResume(id, req.user.sub);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req: any) {
        return this.resumesService.remove(id, req.user.sub);
    }
}
