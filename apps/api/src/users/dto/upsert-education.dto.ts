import { IsString, IsOptional, IsBoolean, IsArray, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EducationItemDto {
    @ApiProperty({ description: 'ชื่อสถานศึกษา' })
    @IsString()
    institution!: string;

    @ApiPropertyOptional({ description: 'คณะ' })
    @IsOptional()
    @IsString()
    faculty?: string;

    @ApiPropertyOptional({ description: 'สาขา' })
    @IsOptional()
    @IsString()
    major?: string;

    @ApiPropertyOptional({ description: 'ระดับการศึกษา' })
    @IsOptional()
    @IsString()
    educationLevel?: string;

    @ApiPropertyOptional({ description: 'ชื่อปริญญา' })
    @IsOptional()
    @IsString()
    degreeName?: string;

    @ApiPropertyOptional({ description: 'ปีที่สำเร็จการศึกษา' })
    @IsOptional()
    @IsInt()
    graduationYear?: number;

    @ApiPropertyOptional({ description: 'เกรดเฉลี่ย' })
    @IsOptional()
    @IsNumber()
    gpa?: number;

    @ApiPropertyOptional({ description: 'เกียรตินิยม', default: false })
    @IsOptional()
    @IsBoolean()
    hasHonors?: boolean;
}

export class UpsertEducationDto {
    @ApiProperty({ type: [EducationItemDto], description: 'รายการประวัติการศึกษา' })
    @IsArray()
    items!: EducationItemDto[];
}
