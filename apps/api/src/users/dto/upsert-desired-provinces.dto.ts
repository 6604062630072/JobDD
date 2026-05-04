import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpsertDesiredProvincesDto {
    @ApiProperty({
        description: 'รายชื่อจังหวัดที่สนใจทำงาน',
        example: ['กรุงเทพมหานคร', 'นนทบุรี'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    provinces: string[];
}