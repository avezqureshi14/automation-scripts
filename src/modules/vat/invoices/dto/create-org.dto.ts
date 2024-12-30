// src/invoice/dto/create-organization.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  trn: string;

  @IsString()
  @IsNotEmpty()
  orgid: string;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsOptional()
  nicUsername?: string;

  @IsString()
  @IsOptional()
  nicPassword?: string;

  @IsOptional()
  zatcaDetails?: Record<string, any>;

  @IsOptional()
  erpCredentials?: Record<string, any>;

  @IsOptional()
  createdOn?: Date;
}
