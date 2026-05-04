import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobPreferenceItemDto {
    @ApiProperty({ description: 'ตำแหน่งงานที่สนใจ' })
    @IsString()
    position!: string;

    @ApiPropertyOptional({
        description: 'ประเภทงาน (เช่น Full-time, Part-time, Internship)',
        example: 'Full-time'
    })
    @IsString()
    @IsOptional()
    jobType?: string;
}

export class UpsertJobPreferenceDto {
    @ApiProperty({ type: [JobPreferenceItemDto], description: 'รายการงานที่สนใจ' })
    @IsArray()
    items!: JobPreferenceItemDto[];
}
