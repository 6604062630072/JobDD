import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
    imports: [AuthModule, UploadModule, ConfigModule],
    controllers: [ResumesController],
    providers: [ResumesService],
    exports: [ResumesService],
})
export class ResumesModule { }
