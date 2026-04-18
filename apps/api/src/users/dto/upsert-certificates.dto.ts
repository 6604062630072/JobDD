import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CertificateItemDto {
    @ApiProperty({ description: 'ชื่อใบประกาศนียบัตร' })
    @IsString()
    name!: string;

    @ApiPropertyOptional({ description: 'ออกโดย' })
    @IsOptional()
    @IsString()
    issuedBy?: string;

    @ApiPropertyOptional({ description: 'ปีที่ได้รับ' })
    @IsOptional()
    @IsString()
    issueYear?: string;

    @ApiPropertyOptional({ description: 'URL รูปเกียรติบัตร' })
    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class UpsertCertificatesDto {
    @ApiProperty({ type: [CertificateItemDto], description: 'รายการใบประกาศนียบัตร' })
    @IsArray()
    items!: CertificateItemDto[];
}
