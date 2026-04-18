import { ArrayMinSize, IsArray, IsString, IsUrl } from 'class-validator';

export class SubmitVerificationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsUrl({ require_protocol: true }, { each: true })
  verificationDocs!: string[];
}
