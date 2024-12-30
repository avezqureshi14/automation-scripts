import { Body, Controller, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateMetaInfoDto } from './dto/create.metainfo.dto';
import { ApiResponse, ApiOperation, ApiBody, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateOrganizationDto } from './dto/create-org.dto';
import { CombinedEntity } from './entity/invoice.entity';
import { GetInvoiceDetailsDto } from './dto/get-invoice.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ValidateInvoicesDto } from './dto/validate-invoice.dto';
import { InvoiceDetails } from './dto/invoice-details.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Invoice') // This adds a tag for the group of endpoints
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Post('hidden-endpoint')
  @ApiExcludeEndpoint()
  @Post('/organization')
  @ApiOperation({ summary: 'Create a new organization' }) // Describes the operation
  @ApiBody({ type: CreateOrganizationDto }) // Documents the request body
  @ApiResponse({ status: 201, description: 'The organization has been created successfully.', type: CombinedEntity })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async addOrganization(
    @Body() orgData: CreateOrganizationDto,
  ): Promise<CombinedEntity> {
    return this.invoiceService.createOrganization(orgData);
  }

  @Post('hidden-endpoint')
  @ApiExcludeEndpoint()
  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'The invoice has been created successfully.', type: CombinedEntity })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async addInvoice(
    @Body() invoiceData: CreateInvoiceDto,
  ): Promise<CombinedEntity> {
    return this.invoiceService.createInvoice(invoiceData);
  }


  @Get('/diff/:invoiceId')
  @ApiOperation({ summary: 'Get invoice errors by inovice id' })
  @ApiParam({
    name: 'invoiceId',
    description: 'The invoice ID to get rectification report ',
    example: '4e921f542203998f93d5ef8b',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice report retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
  })
  async getInvoiceUpdateDiff(@Param('invoiceId') invoiceId: string): Promise<any> {
    return this.invoiceService.getInvoiceUpdateDiff(invoiceId);
  }


  @Post('/details')
  @ApiOperation({ summary: 'Get invoice details based on invoice IDs' })
  @ApiBody({ type: GetInvoiceDetailsDto })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Number of items per page', example: 10 })
  @ApiResponse({ status: 200, description: 'Invoice details fetched successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async getInvoiceDetails(
    @Body() body: { invoiceIds: string[] },
    @Query('page') page = 1,
    @Query('size') size = 10,
  ): Promise<any> {
    return this.invoiceService.getInvoiceDetails(body.invoiceIds, page, size);
  }



  @Post('/validate')
  @ApiOperation({ summary: 'Validate invoices based on VAT ID' })
  @ApiBody({ type: ValidateInvoicesDto })
  @ApiResponse({ status: 200, description: 'Invoices validated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async validateInvoices(
    @Body() body: { vatId: string, startDate: string, endDate: string },
  ): Promise<any> {
    const { vatId } = body;
    return this.invoiceService.validateInvoices(vatId);
  }

  @Post('/validate/invoice')
  @ApiOperation({ summary: 'Validate invoices based on invoice Id' })
  @ApiBody({ type: InvoiceDetails })
  @ApiResponse({ status: 200, description: 'Invoice validated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async validateInvoice(
    @Body() body: { invoiceData: InvoiceDetails },

  ): Promise<any> {
    const invoiceData = body;
    return this.invoiceService.validateInvoice(invoiceData);
  }

  @Get('/all')
  @ApiOperation({ summary: 'Get all invoices with optional search and filtering' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filtering invoices' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for date range filtering (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for date range filtering (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Number of items per page', example: 10 })
  @ApiResponse({ status: 200, description: 'Invoices fetched successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async getAllInvoices(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page = 1,
    @Query('size') size = 10,
  ): Promise<any> {
    return this.invoiceService.getAllInvoices(search, startDate, endDate, page, size);
  }

  @Get('aggregate-data/:vatId')
  @ApiParam({
    name: 'vatId',
    description: 'The VAT ID to aggregate data for',
    example: '453296748994851', // Example value for Swagger
  })
  async aggregateVatData(@Param('vatId') vatId: string) {
    return this.invoiceService.aggregateVatData(vatId);
  }

  @Get('/details/:invoiceId')
  @ApiOperation({ summary: 'Get details for a single invoice by its ID' })
  @ApiParam({
    name: 'invoiceId',
    description: 'The unique identifier of the invoice to fetch details for',
    example: '4e921f542203998f93d5ef8b',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice details retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
  })
  async getSingleInvoiceDetails(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.getInvoiceDetailsForSingleInvoice(invoiceId);
  }

  @Get('/errors/:invoiceId')
  @ApiOperation({ summary: 'Get invoice errors by inovice id' })
  @ApiParam({
    name: 'invoiceId',
    description: 'The invoice ID to get errors for',
    example: '4e921f542203998f93d5ef8b',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice details retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
  })
  async getInvoiceErrors(@Param('invoiceId') invoiceId: string): Promise<any> {
    return this.invoiceService.getInvoiceErrors(invoiceId);
  }

  @Put('/update/:invoiceId')
  @ApiOperation({ summary: 'Update the details of an invoice by its ID' })
  @ApiParam({
    name: 'invoiceId',
    description: 'The unique identifier of the invoice to update',
    example: '4e921f542203998f93d5ef8b', // Example value
  })
  @ApiBody({
    description: 'Updated invoice data',
    type: Object,  // You can replace this with a more specific DTO if needed
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found.',
  })
  async updateInvoiceDetails(
    @Param('invoiceId') invoiceId: string,
    @Body() updatedData: any,  // Get updated data from the body of the request
  ) {
    return this.invoiceService.updateInvoiceDetails(invoiceId, updatedData);
  }

  @Post('/validate-by-id/:invoiceId')
  @ApiOperation({ summary: 'Validate an invoice by its ID' })
  @ApiParam({
    name: 'invoiceId',
    description: 'The unique identifier of the invoice to validate',
    example: '4e921f542203998f93d5ef8b',
  })
  @ApiResponse({ status: 200, description: 'Invoice validated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid invoice ID or validation error.' })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async validateInvoiceById(
    @Param('invoiceId') invoiceId: string,
  ): Promise<any> {
    return this.invoiceService.validateInvoiceById(invoiceId);
  }

  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' must match the FormData key
  async uploadInvoice(@UploadedFile() file: Express.Multer.File) {
    try {
      const fileUrl = await this.invoiceService.uploadInvoiceFile(file);
      return {
        message: 'File uploaded successfully.',
        fileUrl,
      };
    } catch (error) {
      console.error('Error in uploadInvoice:', error);
      throw error;
    }
  }
}

