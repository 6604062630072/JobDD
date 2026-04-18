import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'อีเมลไม่ถูกต้อง' })
    email!: string;

    @ApiProperty({ example: 'Password1' })
    @IsString()
    @MinLength(1, { message: 'กรุณาระบุรหัสผ่าน' })
    password!: string;

    @ApiProperty({
        example: 'JOBSEEKER',
        enum: UserRole,
        required: false
    })
    @IsEnum(UserRole, { message: 'บทบาทไม่ถูกต้อง' })
    @IsOptional()
    role?: UserRole;
}
