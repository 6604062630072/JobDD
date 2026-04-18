import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RegisterRole {
    JOBSEEKER = 'JOBSEEKER',
    EMPLOYER = 'EMPLOYER',
}

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
    email!: string;

    @ApiProperty({ example: 'Password1', minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    @Matches(/[A-Z]/, { message: 'ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว' })
    @Matches(/[0-9]/, { message: 'ต้องมีตัวเลขอย่างน้อย 1 ตัว' })
    password!: string;

    @ApiProperty({ example: 'สมชาย' })
    @IsString()
    @IsNotEmpty({ message: 'กรุณาระบุชื่อ' })
    firstName!: string;

    @ApiProperty({ example: 'ใจดี' })
    @IsString()
    @IsNotEmpty({ message: 'กรุณาระบุนามสกุล' })
    lastName!: string;

    @ApiProperty({ enum: RegisterRole, example: 'JOBSEEKER' })
    @IsEnum(RegisterRole)
    role!: RegisterRole;

    @ApiPropertyOptional({ example: '0812345678' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'บริษัท จ๊อบสบาย จำกัด' })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiPropertyOptional({ example: 'เทคโนโลยี' })
    @IsOptional()
    @IsString()
    industry?: string;
}
