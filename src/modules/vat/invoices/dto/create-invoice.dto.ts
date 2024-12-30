import { IsString, IsDate, IsOptional, IsUrl } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  businessId: string;

  @IsString()
  invoiceId: string;

  @IsString()
  fileType: string;

  @IsString()
  source: string;

  @IsString()
  IRNstatus: string;

  @IsUrl()
  linodeObjectKey_v1: string;

  @IsUrl()
  linodeObjectKey: string;

  @IsString()
  documentType: string;

  @IsOptional()
  @IsDate()
  createdOn?: Date;

  @IsString()
  status: string;
}


