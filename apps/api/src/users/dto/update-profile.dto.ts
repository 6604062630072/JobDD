import { IsOptional, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiPropertyOptional({ description: 'วันเกิด (ISO 8601)', example: '1995-06-15' })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiPropertyOptional({ description: 'ส่วนสูง (ซม.)', example: 170 })
    @IsOptional()
    @IsNumber()
    @Min(50)
    @Max(300)
    height?: number;

    @ApiPropertyOptional({ description: 'น้ำหนัก (กก.)', example: 65 })
    @IsOptional()
    @IsNumber()
    @Min(20)
    @Max(500)
    weight?: number;

    @ApiPropertyOptional({ description: 'เพศ', example: 'male' })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiPropertyOptional({ description: 'เบอร์โทรศัพท์', example: '0812345678' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'LINE ID', example: 'mylineid' })
    @IsOptional()
    @IsString()
    lineId?: string;

    @ApiPropertyOptional({ description: 'สัญชาติ', example: 'ไทย' })
    @IsOptional()
    @IsString()
    nationality?: string;

    @ApiPropertyOptional({ description: 'สถานภาพสมรส', example: 'โสด' })
    @IsOptional()
    @IsString()
    maritalStatus?: string;

    @ApiPropertyOptional({ description: 'สถานภาพทางทหาร', example: 'ได้รับการยกเว้น' })
    @IsOptional()
    @IsString()
    militaryStatus?: string;

    @ApiPropertyOptional({ description: 'ที่อยู่ปัจจุบัน' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'จังหวัด' })
    @IsOptional()
    @IsString()
    province?: string;

    @ApiPropertyOptional({ description: 'เขต/อำเภอ' })
    @IsOptional()
    @IsString()
    district?: string;

    @ApiPropertyOptional({ description: 'แขวง/ตำบล' })
    @IsOptional()
    @IsString()
    subDistrict?: string;

    @ApiPropertyOptional({ description: 'รหัสไปรษณีย์' })
    @IsOptional()
    @IsString()
    postalCode?: string;

    @ApiPropertyOptional({ description: 'เปิดเผยข้อมูลโปรไฟล์' })
    @IsOptional()
    isPublic?: boolean;
}
