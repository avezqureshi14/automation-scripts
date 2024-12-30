import { Controller, Get, Delete, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { VatService } from './vat.service';
import { ApiOperation, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';

@Controller('vat')
export class VatController {
    constructor(private readonly vatService: VatService) { }

    /**
     * Endpoint to get all VAT filings with pagination.
     * @param page - The page number for pagination.
     * @param size - The number of records per page.
     * @returns An object containing the paginated VAT filings and pagination details.
     */
    @Get('all-filings')
    @ApiOperation({ summary: 'Retrieve all VAT filings with pagination.' })
    @ApiQuery({
        name: 'page',
        description: 'The page number for pagination',
        required: false,
        example: 1,
    })
    @ApiQuery({
        name: 'size',
        description: 'The number of records per page',
        required: false,
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: 'VAT filings retrieved successfully with pagination details.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error while retrieving VAT filings.',
    })
    async getAllVatFilings(
        @Query('page') page: number = 1,
        @Query('size') size: number = 10,
    ) {
        try {
            const result = await this.vatService.getAllVatFilings(page, size);
            return { success: true, ...result };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to fetch VAT filings',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Endpoint to remove a specific invoice from the failedInvoices array.
     * @param vatId - The unique ID of the VAT filing.
     * @param invoiceId - The unique ID of the invoice to be removed from the failedInvoices array.
     * @returns The updated VAT Filing record.
     */
    @Delete(':vatId/:invoiceId')
    @ApiOperation({ summary: 'Remove a specific invoice from the failedInvoices array in a VAT filing' })
    @ApiParam({
        name: 'vatId',
        description: 'The unique ID of the VAT filing',
        example: '684513313828587',
    })
    @ApiParam({
        name: 'invoiceId',
        description: 'The unique ID of the invoice to remove from the failedInvoices array',
        example: '58p7ce6lb3',
    })
    @ApiResponse({
        status: 200,
        description: 'Invoice successfully removed from the VAT filing.',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request, invalid parameters.',
    })
    @ApiResponse({
        status: 404,
        description: 'VAT filing or invoice not found.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error while removing the invoice.',
    })
    async removeInvoice(
        @Param('vatId') vatId: string,
        @Param('invoiceId') invoiceId: string,
    ) {
        try {
            const updatedVatFiling = await this.vatService.removeInvoice(vatId, invoiceId);
            return { success: true, data: updatedVatFiling };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to remove the invoice from the VAT filing',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Endpoint to retrieve VAT Filing details by vatId.
     * @param vatId - The unique ID of the VAT filing.
     * @returns The VAT Filing details.
     */
    @Get(':vatId')
    @ApiOperation({ summary: 'Retrieve VAT Filing details by vatId' })
    @ApiParam({
        name: 'vatId',
        description: 'The unique ID of the VAT filing',
        example: '453296748994851',
    })
    @ApiResponse({
        status: 200,
        description: 'VAT Filing details retrieved successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'VAT Filing not found.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error while retrieving VAT Filing details.',
    })
    async getVatFilingByVatId(@Param('vatId') vatId: string) {
        try {
            const vatFiling = await this.vatService.getVatFilingByVatId(vatId);
            return { success: true, data: vatFiling };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to retrieve VAT filing details',
                },
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
