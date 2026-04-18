import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
    @ApiProperty({ description: 'ID ของประกาศงานที่ต้องการสมัคร' })
    @IsNotEmpty()
    @IsUUID()
    jobId!: string;

    @ApiProperty({ description: 'ID ของ Resume (optional)', required: false })
    @IsOptional()
    @IsString()
    resumeId?: string;
}
