import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ErpnextService } from './erpnext.service';
import { AxiosResponse } from 'axios';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ShareholderDto } from './dto/create-shareholder.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@ApiTags('ERPNext') // Define a tag to group related routes in the Swagger UI
@Controller('erp/erpnext')
export class ErpnextController {
    constructor(private readonly erpnextService: ErpnextService) { }


    @Post('/invoice')
    @ApiOperation({ summary: 'Create an invoice' })
    @ApiBody({
        description: 'Invoice data to be created',
        type: Object,  // You can define a specific DTO for better validation and clarity
        examples: {
            default: {
                value: {
                    businessid: 'TRN002',
                    filetype: 'invoice',
                    source: 'api',
                    irnstatus: 'Generated',
                    documenttype: 'invoice',
                    createdOn: '2024-11-07T00:00:00.000Z',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Invoice successfully created.' })
    @ApiResponse({ status: 400, description: 'Error creating invoice.' })
    async createInvoice(@Body() invoiceData: any): Promise<AxiosResponse<any>> {
        try {
            const response = await this.erpnextService.addInvoice(invoiceData);
            return response;
        } catch (error) {
            throw new HttpException('Error creating invoice', HttpStatus.BAD_REQUEST);
        }
    }

    @Get('hidden-endpoint')
    @ApiExcludeEndpoint()
    @Get('/invoices')
    @ApiOperation({ summary: 'Fetch invoices by organization name' })
    @ApiResponse({ status: 200, description: 'List of invoices retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Error fetching invoices.' })
    async getInvoices(@Body() orgName: any): Promise<AxiosResponse<any>> {
        try {
            const response = await this.erpnextService.getInvoicesByOrg(orgName);
            return response;
        } catch (error) {
            throw new HttpException('Error fetching invoices', HttpStatus.BAD_REQUEST);
        }
    }

    @Get('hidden-endpoint')
    @ApiExcludeEndpoint()
    @Post('/organization')
    @ApiOperation({ summary: 'Create a company/organization' })
    @ApiResponse({ status: 201, description: 'Organization created successfully.' })
    @ApiResponse({ status: 400, description: 'Error creating company.' })
    async createCompany(@Body() orgData: any): Promise<AxiosResponse<any>> {
        try {
            const response = await this.erpnextService.addOrgWithCountryId(orgData);
            return response;
        } catch (error) {
            throw new HttpException('Error creating company', HttpStatus.BAD_REQUEST);
        }
    }

    @Get('/date-range')
    @ApiOperation({ summary: 'Get invoices by date range and TRN' })
    @ApiQuery({
        name: 'trn',
        required: true,
        description: 'Business Tax Registration Number (TRN)',
        example: '300270962800003',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-11-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-11-12',
    })
    @ApiResponse({
        status: 200,
        description: 'Invoices retrieved successfully for the given date range',
    })
    @ApiResponse({
        status: 400,
        description: 'Error fetching invoices by date range',
    })
    async getInvoicesByDateRange(
        @Query('trn') trn: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ): Promise<AxiosResponse<any>> {
        try {
            const response = await this.erpnextService.getInvoicesByDateRange(trn, startDate, endDate);
            return response;
        } catch (error) {
            console.log(error);
            throw new HttpException('Error fetching invoices by date range', HttpStatus.BAD_REQUEST);
        }
    }
    @Get('/date-range-by-group-trn')
    @ApiOperation({ summary: 'Get invoices by date range and TRN' })
    @ApiQuery({
        name: 'groupTrn',
        required: true,
        description: 'Group Tax Registration Number (TRN)',
        example: '300270962800003',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-11-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-11-12',
    })
    @ApiResponse({
        status: 200,
        description: 'Invoices retrieved successfully for the given date range',
    })
    @ApiResponse({
        status: 400,
        description: 'Error fetching invoices by date range',
    })
    async getInvoicesByDateRangeGroupTRN(
        @Query('groupTrn') groupTrn: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ): Promise<AxiosResponse<any>> {
        try {
            const response = await this.erpnextService.getInvoicesByDateRangeGroupTRN(groupTrn, startDate, endDate);
            return response;
        } catch (error) {
            console.log(error);
            throw new HttpException('Error fetching invoices by date range', HttpStatus.BAD_REQUEST);
        }
    }


    @Put('/invoice/update/:invoiceID')
    @UseInterceptors(FileInterceptor('file'))
    async updateInvoice(
        @Param('invoiceID') invoiceID: string,    // Accepting invoiceID from the URL parameter
        @UploadedFile() file: Express.Multer.File  // Accepting the file
    ): Promise<any> {
        return this.erpnextService.updateInvoiceDetails(file, invoiceID);  // Passing both parameters to the service
    }

    @Post('/shareholder')
    @ApiOperation({ summary: 'Create a new shareholder' })
    @ApiResponse({ status: 201, description: 'Shareholder created successfully.' })
    @ApiResponse({ status: 400, description: 'Error creating shareholder.' })
    async createShareholder(@Body() shareholderDto: ShareholderDto) {
        try {
            const createdShareholder = await this.erpnextService.addShareholder(shareholderDto);
            return { message: 'Shareholder created successfully', data: createdShareholder };
        } catch (error) {
            return { message: 'Error creating shareholder', error: error.message };
        }
    }

    @Get('/shareholder')
    @ApiOperation({ summary: 'Fetch all shareholders' })
    @ApiResponse({ status: 200, description: 'Shareholders fetched successfully.' })
    @ApiResponse({ status: 400, description: 'Error fetching shareholders.' })
    async getShareholders() {
        try {
            const shareholders = await this.erpnextService.getShareholders();
            return { message: 'Shareholders fetched successfully', data: shareholders };
        } catch (error) {
            return { message: 'Error fetching shareholders', error: error.message };
        }
    }

    @Get('/signatory')
    @ApiOperation({ summary: 'Fetch all signatories' })
    @ApiResponse({ status: 200, description: 'Signatories fetched successfully.' })
    @ApiResponse({ status: 400, description: 'Error fetching signatories.' })
    async getSignatory() {
        try {
            const shareholders = await this.erpnextService.getSignatory();
            return { message: 'Signatories fetched successfully', data: shareholders };
        } catch (error) {
            return { message: 'Error fetching signatories', error: error.message };
        }
    }

    @Post('/signatory')
    @ApiOperation({ summary: 'Create a new signatory' })
    @ApiResponse({ status: 201, description: 'Signatory created successfully.' })
    @ApiResponse({ status: 400, description: 'Error creating signatory.' })
    async createSignatory(@Body() signatoryData: any) {
        try {
            const shareholders = await this.erpnextService.addSignatory(signatoryData);
            return { message: 'Signatory created successfully', data: shareholders };
        } catch (error) {
            return { message: 'Error creating signatory', error: error.message };
        }
    }

    @Get('/branch')
    @ApiOperation({ summary: 'Fetch all branches' })
    @ApiResponse({ status: 200, description: 'Branches fetched successfully.' })
    @ApiResponse({ status: 400, description: 'Error fetching branches.' })
    async getBranch() {
        try {
            const branches = await this.erpnextService.getBranch();
            return { message: 'Branches fetched successfully', data: branches };
        } catch (error) {
            return { message: 'Error fetching branches', error: error.message };
        }
    }

    @Post('/branch')
    @ApiOperation({ summary: 'Create a new branch' })
    @ApiResponse({ status: 201, description: 'Branch created successfully.' })
    @ApiResponse({ status: 400, description: 'Error creating branch.' })
    async createBranch(@Body() branchData: any) {
        try {
            const branches = await this.erpnextService.addBranch(branchData);
            return { message: 'Branch created successfully', data: branches };
        } catch (error) {
            return { message: 'Error creating branch', error: error.message };
        }
    }

    @Get('/vat-business')
    @ApiOperation({ summary: 'Fetch all business details' })
    @ApiResponse({ status: 200, description: 'Business fetched successfully.' })
    @ApiResponse({ status: 400, description: 'Error fetching business.' })
    async getBusiness() {
        try {
            const shareholders = await this.erpnextService.getBusiness();
            return { message: 'Branches fetched successfully', data: shareholders };
        } catch (error) {
            return { message: 'Error fetching business', error: error.message };
        }
    }

    @Post('/vat-business')
    @ApiOperation({ summary: 'Create a new business' })
    @ApiResponse({ status: 201, description: 'Business created successfully.' })
    @ApiResponse({ status: 400, description: 'Error creating business.' })
    async createBusiness(@Body() businessData: any) {
        try {
            const shareholders = await this.erpnextService.addBusiness(businessData);
            return { message: 'Branch created successfully', data: shareholders };
        } catch (error) {
            return { message: 'Error creating business', error: error.message };
        }
    }

    @Get('/vat-business/:trnNumber')
    @ApiOperation({ summary: 'Fetch a business by Business TRN number' })
    @ApiParam({
        name: 'trnNumber',
        description: 'The unique TRN number of the business to fetch',
        example: 'TRN002',
    })
    @ApiResponse({ status: 200, description: 'Business retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Error fetching business.' })
    @ApiResponse({ status: 404, description: 'Business not found with the provided TRN number.' })
    async getBusinessByTrnNumber(@Param('trnNumber') trnNumber: string): Promise<AxiosResponse<any>> {
        try {
            const response = await this.erpnextService.getBusinessByTRN(trnNumber);
            return response;
        } catch (error) {
            throw new HttpException('Error fetching business by TRN number', HttpStatus.BAD_REQUEST);
        }
    }
}
