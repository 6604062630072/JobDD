import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LanguageItemDto {
    @ApiProperty({ description: 'ภาษา' })
    @IsString()
    language!: string;

    @ApiPropertyOptional({ description: 'ระดับภาษา' })
    @IsOptional()
    @IsString()
    level?: string;

    @ApiPropertyOptional({ description: 'ระดับการพูด' })
    @IsOptional()
    @IsString()
    speaking?: string;

    @ApiPropertyOptional({ description: 'ระดับการอ่าน' })
    @IsOptional()
    @IsString()
    reading?: string;

    @ApiPropertyOptional({ description: 'ระดับการเขียน' })
    @IsOptional()
    @IsString()
    writing?: string;
}

export class LanguageTestItemDto {
    @ApiProperty({ description: 'ชื่อผลสอบ' })
    @IsString()
    testName!: string;

    @ApiPropertyOptional({ description: 'คะแนนที่ได้รับ' })
    @IsOptional()
    @IsString()
    score?: string;

    @ApiPropertyOptional({ description: 'ลิงก์ไฟล์แนบ (PDF)' })
    @IsOptional()
    @IsString()
    fileUrl?: string;
}

export class UpsertLanguagesDto {
    @ApiProperty({ type: [LanguageItemDto], description: 'ความสามารถทางภาษา' })
    @IsArray()
    languages!: LanguageItemDto[];

    @ApiProperty({ type: [LanguageTestItemDto], description: 'ผลสอบระดับภาษา' })
    @IsArray()
    tests!: LanguageTestItemDto[];
}
