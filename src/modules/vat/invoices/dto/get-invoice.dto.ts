import { ApiProperty } from '@nestjs/swagger';

export class GetInvoiceDetailsDto {
    @ApiProperty({
        type: [String],
        description: 'List of invoice IDs to fetch details for.',
        example: [
            "671a89483d0bd51cab594675",
        ],
    })
    invoiceIds: string[];
}
