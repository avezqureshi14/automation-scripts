import { Prop } from '@nestjs/mongoose';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
export class CreateMetaInfoDto {
  @IsString()
  business_id: string;

  @IsString()
  organisation_id: string;

  @IsString()
  user_id: string;

  @IsOptional()
  @IsDateString()
  from: string;

  @IsOptional()
  @IsDateString()
  to: string;
}
