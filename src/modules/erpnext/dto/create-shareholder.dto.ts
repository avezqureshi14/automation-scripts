import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
export class ShareholderDto {
    @IsNotEmpty()
    @IsString()
    shareholdername: string;

    @IsNotEmpty()
    @IsNumber()
    shareholdernumber: number;

    @IsNotEmpty()
    @IsNumber()
    numberofsharesheld: number;

    @IsNotEmpty()
    @IsNumber()
    percentageoftotalnumberofsharesissued: number;
}