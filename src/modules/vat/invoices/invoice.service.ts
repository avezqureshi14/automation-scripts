import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomInt, randomUUID } from 'crypto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateOrganizationDto } from './dto/create-org.dto';
import { CombinedEntity } from './entity/invoice.entity';
import { INOVICE } from 'src/constants/error';
import { getFileSizeFromURL, getLinodeInvoiceData, validateLinodeUrl } from './helpers/linode';
import { checkPositiveAmounts, extractVatData, mapResponseForVatCheck, vatCheck } from './helpers/vat';
import ExcelService from '../../../common/excel/excel.service';
import { VatService } from '../../vat/vat.service';
import { aggregateAmounts, detectChanges, generateReport, mapInvoiceData } from './helpers/invoice';
import { LinodeService } from '../../../common/linode/linode.service';
@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(CombinedEntity.name)
    private invoiceModel: Model<CombinedEntity>,
    private excelService: ExcelService,
    private vatService: VatService,
    private linodeService: LinodeService,
    // @InjectModel(MetaInfo.name, 'users-db')
    // private metaInfoSchema: Model<MetaInfo>,
  ) { }

  async createOrganization(
    orgData: CreateOrganizationDto,
  ): Promise<CombinedEntity> {
    const existingOrganization = await this.invoiceModel.findOne({
      isOrganization: true,
    });
    if (existingOrganization) {
      throw new ConflictException(INOVICE.ORGANIZATION_EXISTS);
    }

    const newOrganization = new this.invoiceModel({
      ...orgData,
      createdOn: orgData.createdOn ? new Date(orgData.createdOn) : new Date(),
      isOrganization: true,
    });
    return await newOrganization.save();
  }
  async createInvoice(invoiceData: CreateInvoiceDto): Promise<CombinedEntity> {

    const organizationExists = await this.invoiceModel.exists({
      isOrganization: true,
    });
    // if (!organizationExists) {
    //   throw new NotFoundException(INOVICE.ORGANIZATION_NOT_FOUND);
    // }

    const existingInvoice = await this.invoiceModel.findOne({
      invoiceId: invoiceData.invoiceId,
    });
    if (existingInvoice) {
      console.log(`Invoice with ID ${invoiceData.invoiceId} already exists. Skipping creation.`);
      return existingInvoice;
    }


    const newInvoice = new this.invoiceModel({
      ...invoiceData,
      isOrganization: false,
    });
    return await newInvoice.save();
  }
  async getAllInvoices(
    search?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    size = 10
  ): Promise<any> {
    const filter: Record<string, any> = {};
    page = Number(page);
    size = Number(size);
    if ((startDate && !endDate) || (!startDate && endDate)) {
      throw new BadRequestException(
        "Both startDate and endDate are required for date filtering."
      );
    }

    if (search) {
      filter.$or = [
        { invoiceId: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      filter.createdOn = {
        $gte: start,
        $lte: end,
      };
    }

    const skip = (page - 1) * size;
    const limit = size;

    try {
      const invoices = await this.invoiceModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdOn: -1 })
        .exec();

      const totalRecords = await this.invoiceModel.countDocuments(filter);

      // Calculate total number of pages
      const totalPages = Math.ceil(totalRecords / size); // Correctly calculate total pages
      const pagination = {
        previous: page > 1 ? (page - 1) : null,
        current: page,
        next: page < totalPages ? (page + 1) : null, // Correctly set next based on total pages
        total: totalPages,
        size: size,
        records: {
          total: totalRecords,
          onPage: invoices.length,
        },
      };

      // Ensure pagination values are numbers, not strings
      pagination.previous = pagination.previous !== null ? Number(pagination.previous) : null;
      pagination.current = Number(pagination.current);
      pagination.next = pagination.next !== null ? Number(pagination.next) : null;
      pagination.size = Number(pagination.size);

      return {
        data: invoices,
        message: "Invoices fetched successfully",
        code: "200",
        pagination,
      };
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw new BadRequestException("Failed to fetch invoices");
    }
  }
  async getInvoiceDetails(invoiceIds: string[], page: number, size: number): Promise<any> {
    const allMappedData = [];
    const errors: Record<string, any> = {};

    for (const invoiceId of invoiceIds) {
      try {
        const invoiceDetails = await this.fetchAndValidateInvoiceData(invoiceId);
        if (!invoiceDetails) {
          errors[invoiceId] = `Invoice data not found`;
          continue;
        }


        const mappedData = await this.parseAndMapInvoiceData(invoiceDetails);
        if (!mappedData) {
          errors[invoiceId] = `Invalid Linode data`;
          continue;
        }

        const invoice = {
          businessId: invoiceDetails._doc.businessId,
          invoiceId: invoiceDetails._doc.invoiceId,
          fileType: invoiceDetails._doc.fileType,
          source: invoiceDetails._doc.source,
          IRNstatus: invoiceDetails._doc.IRNstatus,
          linodeObjectKey: invoiceDetails._doc.linodeObjectKey,
          documentType: invoiceDetails._doc.documentType,
          createdOn: invoiceDetails._doc.createdOn,
        };


        // Validate the invoice and safely access the response
        const validationResponse = await this.validateInvoiceById(invoiceId);
        let validationErrors: any[] = [];

        if ('data' in validationResponse && validationResponse.data.invoice) {
          validationErrors = validationResponse.data.invoice.error || [];
        } else if ('errors' in validationResponse) {
          validationErrors = validationResponse.errors || [];
        }

        allMappedData.push({
          data: { ...mappedData },
          invoice: { ...invoice },
          errors: validationErrors,
        });

      } catch (error) {
        console.error(`Error fetching or processing invoice ${invoiceId}:`, error);
        errors[invoiceId] = error.message || 'Processing error';
      }
    }

    const paginatedData = this.paginateData(allMappedData, page, size);

    const response = {
      data: paginatedData,
      message: "Successful",
      code: "200",
      errors: Object.keys(errors).length > 0 ? errors : null,
      page: this.getPaginationDetails(allMappedData.length, page, size),
    };

    return response;
  }


  async getInvoiceDetailsForSingleInvoice(invoiceId: string): Promise<any> {
    const errors: Record<string, any> = {};
    const allMappedData = [];

    try {
      const invoiceDetails = await this.fetchAndValidateInvoiceData(invoiceId);

      if (!invoiceDetails) {
        errors[invoiceId] = `Invoice data not found`;
        return { success: false, errors };
      }


      const mappedData = await this.parseAndMapInvoiceData(invoiceDetails);
      if (!mappedData) {
        errors[invoiceId] = `Invalid Linode data`;
        return { success: false, errors };
      }

      const linodeObjectKey = invoiceDetails._doc.linodeObjectKey;

      // Compute fileName and fileFormat from linodeObjectKey
      const fileName = linodeObjectKey.split('/').pop() || 'Unknown File'; // Extract file name
      const fileFormat = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN'; // Extract file format

      // Placeholder for fileSize (You can fetch this dynamically using an API call to Linode)
      let fileSize = 0;
      try {
        fileSize = await getFileSizeFromURL(linodeObjectKey); // Implement this helper method
      } catch (sizeError) {
        console.error(`Error fetching file size for ${linodeObjectKey}:`, sizeError);
        fileSize = -1; // Indicate failure to retrieve size
      }

      // Validate the invoice and safely access the response
      const validationResponse = await this.validateInvoiceById(invoiceId);
      let validationErrors: any[] = [];

      if ('data' in validationResponse && validationResponse.data.invoice) {
        validationErrors = validationResponse.data.invoice.error || [];
      } else if ('errors' in validationResponse) {
        validationErrors = validationResponse.errors || [];
      }

      const invoice = {
        businessId: invoiceDetails._doc.businessId,
        invoiceId: invoiceDetails._doc.invoiceId,
        fileType: invoiceDetails._doc.fileType,
        source: invoiceDetails._doc.source,
        IRNstatus: invoiceDetails._doc.IRNstatus,
        linodeObjectKey: invoiceDetails._doc.linodeObjectKey,
        documentType: invoiceDetails._doc.documentType,
        createdOn: invoiceDetails._doc.createdOn,
        fileName,
        fileSize,
        fileFormat,
      };

      allMappedData.push({
        data: { ...mappedData },
        invoice: { ...invoice },
        errors: validationErrors,
      });


    } catch (error) {
      console.error(`Error fetching or processing invoice ${invoiceId}:`, error);
      errors[invoiceId] = error.message || 'Processing error';
    }

    const response = {
      data: allMappedData.length > 0 ? allMappedData[0] : null, // Single invoice, so only the first item
      message: "Successful",
      code: "200",
      errors: Object.keys(errors).length > 0 ? errors : null,
    };

    return response;
  }


  async getInvoiceErrors(invoiceId: string): Promise<string> {
    try {
      const response = await this.getInvoiceDetailsForSingleInvoice(invoiceId);

      // Extract generatedBy and generatedOn from the response
      const generatedBy = response.data.data.generatedBy;
      const generatedOn = response.data.data.generatedOn;

      // Always include generatedBy and generatedOn at the top of the response
      let result = `username: ${generatedBy}\ncreated_at: ${generatedOn}\ninvoiceId:${invoiceId}\n\n`;

      // Extract errors from the response
      const errors =
        response.errors?.[invoiceId] ||
        (response.data?.errors && Array.isArray(response.data.errors)
          ? response.data.errors
          : []);

      // If there are no errors, return the message saying no errors found
      if (!errors?.length) {
        result += "No errors found.";
        return result;
      }


      // Format the errors and add them to the result string
      const formattedErrors = errors
        .map(
          (error: { category: string; code: string; message: string }) =>
            `Category: ${error.category}, Code: ${error.code}, Message: ${error.message}`
        )
        .join("\n\n");

      // Append the formatted errors to the result
      result += formattedErrors;

      return result;
    } catch (error) {
      console.error(`Error fetching invoice errors for ${invoiceId}:`, error);
      return `Unexpected error occurred: ${error.message || "Unknown error"}`;
    }
  }


  async fetchInvoiceDetails(invoiceId: string): Promise<CombinedEntity> {
    try {
      const invoiceDetails = await this.invoiceModel.findOne({ invoiceId }).exec();
      if (!invoiceDetails) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found.`);
      }

      return invoiceDetails;
    } catch (error) {
      console.error(`Error fetching invoice with ID ${invoiceId}:`, error);
      throw error;
    }
  }
  async fetchAndValidateInvoiceData(invoiceId: string): Promise<any> {
    const invoiceDetails = await this.fetchInvoiceDetails(invoiceId);

    if (!invoiceDetails || !invoiceDetails.linodeObjectKey) {
      console.log(`No Linode URLs found for invoice ${invoiceId}. Skipping.`);
      return null;
    }
    const validLinodeUrl = await validateLinodeUrl(invoiceDetails.linodeObjectKey);
    if (!validLinodeUrl) {
      console.log(`No valid Linode data found for invoice ${invoiceId}.`);
      return null;
    }

    return { ...invoiceDetails, linodeObjectKey: validLinodeUrl };
  }
  async parseAndMapInvoiceData(invoiceDetails: any): Promise<any> {
    try {
      const linodeInvoiceData = await getLinodeInvoiceData(
        invoiceDetails.linodeObjectKey,
        this.excelService.convertExcelToJson
      );
      const parsedData = JSON.parse(linodeInvoiceData);
      return extractVatData(parsedData);
    } catch (error) {
      console.error(`Error parsing Linode data for invoice ${invoiceDetails.invoiceId}:`, error);
      return null;
    }
  }
  paginateData(data: any[], page: number, size: number): any[] {
    page = Number(page);
    size = Number(size);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return data.slice(startIndex, endIndex);
  }
  getPaginationDetails(totalRecords: number, page: number, size: number): any {
    const totalPages = Math.ceil(totalRecords / size);
    page = Number(page);
    size = Number(size);
    return {
      previous: page > 1 ? page - 1 : null,
      current: page,
      next: page < totalPages ? page + 1 : null,
      total: totalPages,
      size: size,
      records: {
        total: totalRecords,
        onPage: totalRecords,
      },
    };
  }
  async validateInvoices(vatId: string) {
    const invoiceIds = await this.vatService.getFilingInvoicesByVatId(vatId);

    const invoices = [];
    const failedInvoices = []; // Array to store failed invoices
    const errors: Record<string, string> = {};
    let totalErrors = 0;
    let totalInvoiceWithErrors = 0;
    const allInvoiceErrors: any[] = []; // Accumulate all errors across invoices

    for (const invoiceId of invoiceIds) {
      const invoiceErrors: any[] = []; // Errors specific to the current invoice
      try {
        const invoiceDetails = await this.fetchAndValidateInvoiceData(invoiceId);
        if (!invoiceDetails) {
          errors[invoiceId] = `Invoice data not found`;
          continue;
        }


        const mappedData = await this.parseAndMapInvoiceData(invoiceDetails);
        if (!mappedData) {
          errors[invoiceId] = `Invalid Linode data`;
          failedInvoices.push(invoiceId); // Add to failed invoices
          continue;
        }


        const invoice = {
          businessId: invoiceDetails._doc.businessId,
          invoiceId: invoiceDetails._doc.invoiceId,
          fileType: invoiceDetails._doc.fileType,
          source: invoiceDetails._doc.source,
          IRNstatus: invoiceDetails._doc.IRNstatus,
          linodeObjectKey: invoiceDetails._doc.linodeObjectKey,
          documentType: invoiceDetails._doc.documentType,
          createdOn: invoiceDetails._doc.createdOn,
        };

        const invoiceDataForVatCheck: Record<string, string> = {};
        for (const key in mappedData) {
          if (key.startsWith('amount') || key.startsWith('vatAmount')) {
            invoiceDataForVatCheck[key] = mappedData[key]?.toString() || '';
          }
        }

        await this.updateInvoiceDetails(invoiceId, { status: 'Draft' });


        const validationResults = vatCheck(invoiceDataForVatCheck);

        // Positive amounts check
        const positiveAmountResults = checkPositiveAmounts(invoiceDataForVatCheck);
        for (const [key, isValid] of Object.entries(positiveAmountResults)) {
          if (!isValid) {
            invoiceErrors.push({
              category: "Amount Check",
              code: "AMOUNT_NOT_POSITIVE",
              message: `${key} must be positive`,
              _id: invoiceId,
            });
          }
        }

        if (Object.values(validationResults).includes(false)) {
          totalInvoiceWithErrors++;

          for (const [key, isValid] of Object.entries(validationResults)) {
            if (!isValid) {
              invoiceErrors.push({
                category: "VAT Check",
                code: "VAT_CHECK_FAILED",
                message: `${key} validation failed`,
                _id: invoiceDetails._doc.invoiceId,
              });
            }
          }

          totalErrors += invoiceErrors.length;

          // Add failed invoice to the failedInvoices array
          failedInvoices.push(invoiceId);
        }

        invoices.push({
          id: invoiceDetails._doc.invoiceId,
          isValidated: Object.values(validationResults).every(isValid => isValid),
          error: [...invoiceErrors],
        });

        // Add the current invoice's errors to the cumulative errors
        allInvoiceErrors.push(...invoiceErrors);

      } catch (error) {
        errors[invoiceId] = `Error fetching details for invoice ${invoiceId}: ${error.message || error}`;
        failedInvoices.push(invoiceId); // Add to failed invoices on error
      }
    }

    const generalStatus = allInvoiceErrors.length === 0; // True if there are no errors
    const processChecksStatus = true; // All invoices are valid if there are no errors
    const processValidationStatus = true; // All checks pass if there are no errors
    const checkList = {
      check1: allInvoiceErrors.some(err => err.code === "VAT_CHECK_FAILED") ? false : true,
      check2: allInvoiceErrors.some(err => err.code === "AMOUNT_NOT_POSITIVE") ? false : true,
      check3: true,
      check4: true,
      check5: false,
    };

    this.vatService.updateVatFiling(vatId, { failedInvoices: failedInvoices, status: 'Draft' });

    const response = {
      data: {
        invoices,
        generalStatus,
        processChecksStatus,
        processValidationStatus,
        checkList,
        totalInvoiceWithErrors,
        totalErrors,
      },
      vatId: vatId,
      message: "Successful",
      code: "200",
      errors: Object.keys(errors).length > 0 ? errors : null,
    };

    return response;
  }


  async validateInvoice(invoiceData: any) {
    const invoiceId = invoiceData.data[0].invoice.invoiceId
    try {

      const invoiceDataForVatCheck = mapResponseForVatCheck(invoiceData);

      const validationResults = vatCheck(invoiceDataForVatCheck);
      const positiveAmountResults = checkPositiveAmounts(invoiceDataForVatCheck);
      const invoiceErrors = [];

      for (const [key, isValid] of Object.entries(positiveAmountResults)) {
        if (!isValid) {
          invoiceErrors.push({
            category: "Amount Check",
            code: "AMOUNT_NOT_POSITIVE",
            message: `${key} must be positive`,
            _id: invoiceId,
          });
        }
      }

      for (const [key, isValid] of Object.entries(validationResults)) {
        if (!isValid) {
          invoiceErrors.push({
            category: "VAT Check",
            code: "VAT_CHECK_FAILED",
            message: `${key} validation failed`,
            _id: invoiceId,
          });
        }
      }

      const checkList = {
        check1: invoiceErrors.some(err => err.code === "VAT_CHECK_FAILED") ? false : true,
        check2: invoiceErrors.some(err => err.code === "AMOUNT_NOT_POSITIVE") ? false : true,
        check3: true,
        check4: true,
        check5: false,
      };
      // if (invoiceErrors.length == 0) {
      //   this.eventEmitter.emit('invoice.validated', {
      //     invoiceId,
      //     invoiceData,
      //   });
      // }
      const generalStatus = invoiceErrors.length === 0; // True if there are no errors
      const processChecksStatus = true; // All invoices are valid if there are no errors
      const processValidationStatus = true;
      const response = {
        data: {
          invoice: {
            id: invoiceId,
            isValidated: generalStatus,
            error: invoiceErrors,
          },
          generalStatus,
          processChecksStatus,
          processValidationStatus,
          checkList,
        },
        message: "Successful",
        code: "200",
        errors: invoiceErrors.length > 0 ? { [invoiceId]: invoiceErrors } : null,
      };

      return response;
    } catch (error) {
      return {
        data: null,
        message: `Error validating invoice: ${error.message || error}`,
        code: "400",
        errors: {
          [invoiceId]: error.message || "Unknown error",
        },
      };
    }
  }
  async validateInvoiceById(invoiceId: string) {
    try {
      const invoiceDetails = await this.fetchAndValidateInvoiceData(invoiceId);
      if (!invoiceDetails) {
        return {
          success: false,
          message: "Invoice data not found",
          errors: [{ code: "INVOICE_NOT_FOUND", message: "Invoice data not found", _id: invoiceId }],
        };
      }

      const mappedData = await this.parseAndMapInvoiceData(invoiceDetails);
      if (!mappedData) {
        return {
          success: false,
          message: "Invalid invoice data",
          errors: [{ code: "INVALID_INVOICE_DATA", message: "Invalid mapped data", _id: invoiceId }],
        };
      }

      const invoiceDataForVatCheck: Record<string, string> = {};
      for (const key in mappedData) {
        if (key.startsWith('amount') || key.startsWith('vatAmount')) {
          invoiceDataForVatCheck[key] = mappedData[key]?.toString() || '';
        }
      }

      const validationResults = vatCheck(invoiceDataForVatCheck);

      const positiveAmountResults = checkPositiveAmounts(invoiceDataForVatCheck);
      const invoiceErrors = [];

      for (const [key, isValid] of Object.entries(positiveAmountResults)) {
        if (!isValid) {
          invoiceErrors.push({
            category: "Amount Check",
            code: "AMOUNT_NOT_POSITIVE",
            message: `${key} must be positive`,
            _id: invoiceId,
          });
        }
      }

      for (const [key, isValid] of Object.entries(validationResults)) {
        if (!isValid) {
          invoiceErrors.push({
            category: "VAT Check",
            code: "VAT_CHECK_FAILED",
            message: `${key} validation failed`,
            _id: invoiceId,
          });
        }
      }

      const generalStatus = invoiceErrors.length === 0; // True if there are no errors
      const processChecksStatus = true; // All invoices are valid if there are no errors
      const processValidationStatus = true;
      const checkList = {
        check1: invoiceErrors.some(err => err.code === "VAT_CHECK_FAILED") ? false : true,
        check2: invoiceErrors.some(err => err.code === "AMOUNT_NOT_POSITIVE") ? false : true,
        check3: true,
        check4: true,
        check5: true,
      };
      // if (invoiceErrors.length == 0) {
      //   this.eventEmitter.emit('invoice.validated', {
      //     invoiceId,
      //   });
      // }
      const response = {
        data: {
          invoice: {
            id: invoiceId,
            isValidated: generalStatus,
            error: invoiceErrors,
            generalStatus,
            processChecksStatus,
            processValidationStatus,
            checkList,
          },
        },
        success: true,
        message: "Successful",
        code: "200",
      };

      return response;
    } catch (error) {
      return {
        success: false,
        message: `Error validating invoice: ${error.message || error}`,
        errors: [{ code: "VALIDATION_ERROR", message: error.message || "Unknown error", _id: invoiceId }],
      };
    }
  }
  async aggregateVatData(vatId: string) {
    const invoiceIds = await this.vatService.getFilingInvoicesByVatId(vatId);
    const invoiceDetails = await this.getInvoiceDetails(invoiceIds, 1, 1e9);
    const aggregatedData = aggregateAmounts(invoiceDetails);
    const vatDetails = await this.vatService.getVatFilingByVatId(vatId);
    const totalInvoices = vatDetails.data.invoices.length;
    const status = vatDetails.data.status;
    const response = {
      data: aggregatedData,
      status,
      totalInvoices,
      linodeObjectKey: '',
      message: "VAT data aggregated successfully",
      code: "200",
      errors: null
    };

    return response;
  }
  async updateInvoiceDetails(invoiceId: string, updateFields: Partial<CombinedEntity>): Promise<CombinedEntity> {

    try {
      const updatedInvoice = await this.invoiceModel.findOneAndUpdate(
        { invoiceId },
        { $set: updateFields }, // Use the provided fields to update
        { new: true, runValidators: true }
      );


      if (!updatedInvoice) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found.`);
      }

      return updatedInvoice;
    } catch (error) {
      console.error(`Error updating invoice with ID ${invoiceId}:`, error);
      throw new BadRequestException(`Failed to update invoice with ID ${invoiceId}`);
    }
  }

  async uploadInvoiceFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    const randomDigits = Math.floor(10000 + Math.random() * 90000);

    const originalFileName = file.originalname;
    const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.')) || '';
    const baseFileName = originalFileName.replace(fileExtension, '');

    const newFileName = `${baseFileName}-${randomDigits}${fileExtension}`;

    const fileBuffer = file.buffer; // File buffer
    return await this.linodeService.uploadFileFromBuffer(newFileName, fileBuffer);
  }

  async getInvoiceById(invoiceId: string): Promise<CombinedEntity> {

    const invoice = await this.invoiceModel.findOne({ invoiceId }).lean();

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found.`);
    }
    //@ts-expect-error
    return invoice;
  }


  async getInvoiceUpdateDiff(invoiceId: string): Promise<any> {
    try {
      // Fetch invoice details
      const invoiceDetails = await this.getInvoiceById(invoiceId);
      if (!invoiceDetails) {
        throw new Error('Invoice details not found');
      }

      const oldVersionUrl = invoiceDetails.linodeObjectKey_v1;
      const newVersionUrl = invoiceDetails.linodeObjectKey;

      if (!oldVersionUrl || !newVersionUrl) {
        throw new Error('Old or new version URL is missing');
      }
      // Convert Excel files to JSON
      const oldData = await this.excelService.convertExcelToJson(oldVersionUrl);
      const newData = await this.excelService.convertExcelToJson(newVersionUrl);

      // Parse new data and extract required details
      const parsedData = JSON.parse(newData);
      const generatedBy = parsedData['Invoice Details']?.GeneratedBy;
      const rectifiedOn = parsedData['Invoice Details']?.GeneratedOn;
      const generatedOn = invoiceDetails.createdOn;

      if (!generatedBy || !rectifiedOn || !generatedOn) {
        throw new Error('Required invoice metadata is missing');
      }

      const miscellData = {
        invoiceId,
        generatedBy,
        generatedOn,
        rectifiedOn,
      };

      // Detect changes between old and new data
      const changes = detectChanges(oldData, newData);
      if (!changes || Object.keys(changes).length === 0) {
        return {
          status: 'success',
          message: 'No changes detected',
          data: null,
        };
      }

      // Generate report and upload file
      const filePath = generateReport(changes, miscellData);
      const linodeUrl = await this.linodeService.uploadFile(filePath);

      return {
        status: 'success',
        message: 'Invoice update diff processed successfully',
        data: linodeUrl,
      };
    } catch (error) {
      console.error('Error in getInvoiceUpdateDiff:', error.message);
      return {
        status: 'error',
        message: error.message,
        data: null,
      };
    }
  }



}


