import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JobPreferenceItemDto {
    @ApiProperty({ description: 'ตำแหน่งงานที่สนใจ' })
    @IsString()
    position!: string;
}

export class UpsertJobPreferenceDto {
    @ApiProperty({ type: [JobPreferenceItemDto], description: 'รายการงานที่สนใจ' })
    @IsArray()
    items!: JobPreferenceItemDto[];
}
