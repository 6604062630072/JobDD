import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],  // JwtService needed by JwtAuthGuard
    controllers: [JobsController],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule { }
