import { ApiProperty } from '@nestjs/swagger';

export class ValidateInvoicesDto {
    @ApiProperty({
        type: String,
        description: 'VAT filing id vatId',
        example: '453296748994851'
    })
    vatId: string;
}
