import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DataDetailsDto {
    @IsString() amount1a: string;
    @IsString() vatAmount1a: string;
    @IsString() adjustment1a: string;
    @IsString() amount1b: string;
    @IsString() vatAmount1b: string;
    @IsString() adjustment1b: string;
    @IsString() amount1c: string;
    @IsString() vatAmount1c: string;
    @IsString() adjustment1c: string;
    @IsString() amount1d: string;
    @IsString() vatAmount1d: string;
    @IsString() adjustment1d: string;
    @IsString() amount1e: string;
    @IsString() vatAmount1e: string;
    @IsString() adjustment1e: string;
    @IsString() amount1f: string;
    @IsString() vatAmount1f: string;
    @IsString() adjustment1f: string;
    @IsString() amount1g: string;
    @IsString() vatAmount1g: string;
    @IsString() adjustment1g: string;
    @IsString() amount2: string;
    @IsString() vatAmount2: string;
    @IsString() amount3: string;
    @IsString() vatAmount3: string;
    @IsString() amount4: string;
    @IsString() amount5: string;
    @IsString() amount6: string;
    @IsString() vatAmount6: string;
    @IsString() amount7: string;
    @IsString() vatAmount7: string;
    @IsString() adjustment7: string;
    @IsString() totalAmount8: string;
    @IsString() totalVatAmount8: string;
    @IsString() totalAdjustment8: string;
    @IsString() amount9: string;
    @IsString() vatAmount9: string;
    @IsString() adjustment9: string;
    @IsString() amount10: string;
    @IsString() vatAmount10: string;
    @IsString() adjustment10: string;
    @IsString() totalAmount11: string;
    @IsString() totalVatAmount11: string;
    @IsString() totalAdjustment11: string;
    @IsString() amount12: string;
    @IsString() vatAmount12: string;
    @IsString() adjustment12: string;
    @IsString() amount13: string;
    @IsString() vatAmount13: string;
    @IsString() adjustment13: string;
    @IsString() amount14: string;
    @IsString() vatAmount14: string;
    @IsString() adjustment14: string;
    @IsBoolean() profitScheme: boolean;
}

class InvoiceDetailsDto {
    @IsString() businessId: string;
    @IsString() invoiceId: string;
    @IsString() fileType: string;
    @IsString() source: string;
    @IsString() IRNstatus: string;
    @IsString() linodeObjectKey: string;
    @IsString() documentType: string;
    @IsString() createdOn: string;
}

class ErrorDetailsDto {
    @IsOptional() @IsString() errorCode?: string;
    @IsOptional() @IsString() errorMessage?: string;
}

class DataDto {
    @ValidateNested()
    @Type(() => DataDetailsDto)
    data: DataDetailsDto;

    @ValidateNested()
    @Type(() => InvoiceDetailsDto)
    invoice: InvoiceDetailsDto;

    @ValidateNested()
    @Type(() => ErrorDetailsDto)
    errors: ErrorDetailsDto;
}

export class InvoiceDetails {
    @ValidateNested({ each: true })
    @Type(() => DataDto)
    data: DataDto[];
}
