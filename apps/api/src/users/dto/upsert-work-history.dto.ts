import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkHistoryItemDto {
    @ApiProperty({ description: 'ชื่อบริษัท' })
    @IsString()
    company!: string;

    @ApiPropertyOptional({ description: 'ประเภทธุรกิจ' })
    @IsOptional()
    @IsString()
    businessType?: string;

    @ApiPropertyOptional({ description: 'ตำแหน่ง' })
    @IsOptional()
    @IsString()
    position?: string;

    @ApiPropertyOptional({ description: 'ประเภทงาน' })
    @IsOptional()
    @IsString()
    jobType?: string;

    @ApiPropertyOptional({ description: 'เดือนเริ่มงาน' })
    @IsOptional()
    @IsString()
    startMonth?: string;

    @ApiPropertyOptional({ description: 'ปีเริ่มงาน' })
    @IsOptional()
    @IsString()
    startYear?: string;

    @ApiPropertyOptional({ description: 'เดือนสิ้นสุด' })
    @IsOptional()
    @IsString()
    endMonth?: string;

    @ApiPropertyOptional({ description: 'ปีสิ้นสุด' })
    @IsOptional()
    @IsString()
    endYear?: string;

    @ApiPropertyOptional({ description: 'ทำงานที่นี่อยู่ปัจจุบัน', default: false })
    @IsOptional()
    @IsBoolean()
    isCurrent?: boolean;
}

export class UpsertWorkHistoryDto {
    @ApiProperty({ type: [WorkHistoryItemDto], description: 'รายการประวัติการทำงาน' })
    @IsArray()
    items!: WorkHistoryItemDto[];
}
