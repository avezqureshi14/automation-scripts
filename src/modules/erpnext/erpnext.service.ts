import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import ExcelService from '../../common/excel/excel.service';
import { LinodeService } from '../../common/linode/linode.service';
import { INOVICE } from 'src/constants/error';
import { createBranch, createBusiness, createShareholder, createSignatory, fetchBusinessByGroupTrn, fetchInvoiceDetails, fetchInvoicesByFilter, fetchBusinessDetails, fetchInvoicesByGroupTrn, getBranches, getBusinessByTrnNumber, getBusinessData, getBusinessDataByGroup, getBusinesses, getShareholders, getSignatories, updateInvoiceInERP, fetchGroupTrnByBusiness } from './utils/httpUtils';
import { getLinodeInvoiceData, validateLinodeUrl } from './helpers/linode';
import { extractVatData, generateUniqueInvoiceId, trnToOrgMapping } from './helpers/vatData';
import { InvoiceService } from '../vat/invoices/invoice.service';
import { OnEvent } from '@nestjs/event-emitter';
import { VatService } from '../vat/vat.service';

// ERPNext API credentials
const API_KEY = '61489f1fbb59403';
const API_SECRET = '627c14a47e51c0e';

// ERPNext Base URL
const ERP_NEXT_URL = 'https://avez-taxlab.erpnext.com/';


// Headers for authentication
const headers = {
    Authorization: `token ${API_KEY}:${API_SECRET}`,
    'Content-Type': 'application/json',
};

@Injectable()
export class ErpnextService {
    constructor(
        private readonly httpService: HttpService,
        private excelService: ExcelService,
        private linodeService: LinodeService,
        private invoiceService: InvoiceService,
        private vatService: VatService
    ) { }

    async getInvoicesByOrg(orgName: string): Promise<AxiosResponse<any>> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${ERP_NEXT_URL}/api/resource/Invoices`, {
                    params: {
                        filters: `{"company": "${orgName}"}`
                    },
                    headers,
                }),
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching invoices for ${orgName}:`, error.response ? error.response.data : error.message);
            throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
        }
    }
    async getCountryId(countryName: string): Promise<string | null> {
        try {
            const response: AxiosResponse<{ data: { name: string }[] }> = await this.httpService
                .get(`${ERP_NEXT_URL}/api/resource/Country`, {
                    params: {
                        filters: {
                            country_name: countryName, // Match the exact country name
                        },
                    },
                    headers,
                })
                .toPromise();

            if (response.data.data.length > 0) {
                return response.data.data[0].name; // Country ID
            } else {
                console.error('Country not found');
                return null;
            }
        } catch (error) {
            console.error('Error fetching country:', error.response ? error.response.data : error.message);
            throw new HttpException('Error fetching country', HttpStatus.BAD_REQUEST);
        }
    }


    async addOrgWithCountryId(orgData: any): Promise<AxiosResponse<any>> {
        const { country_name, ...otherData } = orgData;
        const countryId = await this.getCountryId(country_name);
        if (!countryId) {
            throw new BadRequestException('Country ID not found for the provided country name');
        }

        const neworgData = {
            ...otherData,
            country: countryId,
        };

        try {
            const response = await this.addOrg(neworgData);
            return response;
        } catch (error) {
            console.error('Error adding Org:', error);
            throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
        }
    }

    async addOrg(orgData: any): Promise<AxiosResponse<any>> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${ERP_NEXT_URL}/api/resource/Company`, orgData, { headers }),
            );
            return response.data;
        } catch (error) {
            console.error('Error creating Org:', error.response ? error.response.data : error.message);
            throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
        }
    }

    async addInvoice(invoiceData: any): Promise<AxiosResponse<any>> {
        try {
            // Generate unique custom_invoiceid
            const customInvoiceId = await generateUniqueInvoiceId();

            let excelFilePath: string;
            try {
                excelFilePath = await this.excelService.generateExcel();
            } catch (error) {
                throw new BadRequestException(INOVICE.EXCEL_GENERATION_ERROR);
            }

            let uploadedFileUrl: string;
            try {
                uploadedFileUrl = await this.linodeService.uploadFile(excelFilePath);
            } catch (error) {
                throw new BadRequestException(INOVICE.FILE_UPLOAD_ERROR);
            }

            // Post request to ERPNext
            const response = await firstValueFrom(
                this.httpService.post(`${ERP_NEXT_URL}/api/resource/Invoices`, {
                    ...invoiceData,
                    invoiceid: customInvoiceId,
                    linodeobjectkey: uploadedFileUrl
                }, { headers }),
            );

            return response.data;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }
            console.error('Error creating invoice:', error.response ? error.response.data : error.message);
            throw new HttpException(error.response, HttpStatus.BAD_REQUEST);
        }
    }

    async handleInvoiceIds(invoiceList: any[], startDate: string, endDate: string) {
        try {
            const invoiceIds = await Promise.all(
                invoiceList.map(async (invoice) => {
                    await this.getInvoiceDetails(invoice.name);  // Fetch invoice details
                    const invoiceId = await this.getInvoiceIds(invoice.name);  // Fetch invoice ID
                    return invoiceId;  // Return the invoice ID
                })
            );

            const dateRange = `${startDate},${endDate}`;

            const existingVatFiling = await this.vatService.findVatFilingByDateRange(dateRange);

            let vatFiling;

            if (existingVatFiling) {
                existingVatFiling.filingInvoices = invoiceIds;
                existingVatFiling.status = 'Draft';  // Or any other required status
                vatFiling = await this.vatService.updateVatFilingByDateRange(existingVatFiling);  // Save the updated filing
            } else {
                vatFiling = await this.vatService.createVatFiling(
                    dateRange,
                    invoiceIds,
                    [],
                    "null",
                    'Draft'
                );
            }

            const data1 = invoiceIds.map(id => ({ id }));
            return {
                data: data1,
                vatId: vatFiling.vatId,
                message: "Invoices processed successfully",
                code: "201",
                errors: null,
            };
        } catch (error) {
            console.error("Error handling invoices:", error);
            return {
                data: null,
                message: "Error fetching invoices",
                code: "500",
                errors: error.message,
            };
        }
    }

    async getInvoicesByDateRange(trn: string, startDate: string, endDate: string): Promise<any> {
        try {
            const filters = JSON.stringify([
                ["businessid", "=", trn],
                ["creation", "between", [startDate, endDate]]
            ]);
            const invoiceList = await fetchInvoicesByFilter(filters);
            return this.handleInvoiceIds(invoiceList, startDate, endDate);
        } catch (error) {
            console.error(`Error fetching invoices for ${trn} between ${startDate} and ${endDate}:`, error.response ? error.response.data : error.message);
            throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
        }
    }

    async getInvoicesByDateRangeGroupTRN(grouptrn: string, startDate: string, endDate: string): Promise<any> {
        try {

            const filters = JSON.stringify([
                ["businessid", "=", grouptrn],
                ["creation", "between", [startDate, endDate]]
            ]);
            const invoiceList = await fetchInvoicesByGroupTrn(grouptrn, filters);
            return await this.handleInvoiceIds(invoiceList, startDate, endDate);
        } catch (error) {

        }
    }

    async getInvoiceIds(invoiceName): Promise<any> {
        try {
            const invoiceDetails = await fetchInvoiceDetails(invoiceName);

            if (!invoiceDetails) {
                return;
            }

            return invoiceDetails.invoiceid;
        } catch (error) {
            console.error("Error fetching or processing invoice details", error);
            return null;
        }
    }

    async getInvoiceDetails(invoiceName: string): Promise<any> {
        try {
            const invoiceDetails = await fetchInvoiceDetails(invoiceName);
            if (!invoiceDetails) {
                return;
            }

            const invoice = {
                businessId: invoiceDetails.businessid,
                invoiceId: invoiceDetails.invoiceid,
                fileType: invoiceDetails.filetype,
                source: invoiceDetails.source,
                IRNstatus: invoiceDetails.irnstatus,
                linodeObjectKey_v1: invoiceDetails.linodeobjectkey,
                linodeObjectKey: invoiceDetails.linodeobjectkey,
                documentType: invoiceDetails.documenttype,
                createdOn: invoiceDetails.createdOn,
                status: 'New'
            }

            const groupTrn = await fetchGroupTrnByBusiness(invoice.businessId);
            // this.invoiceService.createInvoice(invoice, groupTrn);
            this.invoiceService.createInvoice(invoice);
            if (!invoice.linodeObjectKey) {
                console.log(`No Linode URLs found for invoice ${invoiceName}. Skipping.`);
                return;
            }

            const validLinodeUrl = await validateLinodeUrl(invoice.linodeObjectKey);
            if (!validLinodeUrl) {
                console.log(`No valid Linode data found for invoice ${invoiceName}.`);
                return;
            }

            const linodeInvoiceData = await getLinodeInvoiceData(validLinodeUrl, this.excelService.convertExcelToJson);
            const parsedData = JSON.parse(linodeInvoiceData);
            const mappedData = extractVatData(parsedData, validLinodeUrl);
            return mappedData;
        } catch (error) {
            console.error("Error fetching or processing invoice details", error);
            return null;
        }
    }

    @OnEvent('invoice.validated')
    async handleInvoiceValidation(payload: { invoiceData: any }): Promise<void> {
        const { invoiceData } = payload;
        console.log('Validation successful. Updating invoice details...');
        try {
            const result = await this.updateInvoiceDetails(invoiceData);
            console.log('Invoice update result:', result);
        } catch (error) {
            console.error('Failed to update invoice:', error.message);
        }
    }

    async updateInvoiceDetails(file: Express.Multer.File, invoiceId?: string): Promise<any> {
        const linodeObjectKey = await this.invoiceService.uploadInvoiceFile(file);
        console.log(`Linode Object Key: ${linodeObjectKey}`);

        try {

            const currentInvoice = await this.invoiceService.getInvoiceDetailsForSingleInvoice(invoiceId);
            if (!currentInvoice) {
                throw new HttpException('Invoice not found.', HttpStatus.NOT_FOUND);
            }
            const linodeObjectKey_v1 = currentInvoice.data.invoice.linodeObjectKey;
            const updatedInvoice = await updateInvoiceInERP(invoiceId, linodeObjectKey);
            if (!updatedInvoice) {
                throw new HttpException('Invoice update failed, no data returned.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const updatePayload = {
                linodeObjectKey_v1,
                linodeObjectKey,
                isUpdated: true
            };

            await this.invoiceService.updateInvoiceDetails(invoiceId, updatePayload);

            const validationResponse = await this.invoiceService.validateInvoiceById(invoiceId);

            if (validationResponse.success === false) {
                return {
                    message: 'Invoice updated, but validation failed',
                    data: {
                        linodeObjectKey,
                        validation: validationResponse,
                    },
                    code: HttpStatus.OK,
                };
            }

            return {
                message: 'Invoice updated and validated successfully',
                data: {
                    linodeObjectKey,
                    validation: validationResponse,
                },
                code: HttpStatus.OK,
            };
        } catch (error) {
            console.error('Error in updating and validating invoice:', error);

            if (error instanceof HttpException) {
                throw new HttpException(error.message, error.getStatus());
            } else if (error.response) {
                console.error(`API Error while updating invoice ${invoiceId}:`, error.response?.data);
                throw new HttpException(error.response?.data || 'Error updating invoice', HttpStatus.BAD_REQUEST);
            } else if (error.request) {
                console.error(`Network Error while updating invoice ${invoiceId}:`, error.request);
                throw new HttpException('Network error occurred while updating invoice', HttpStatus.SERVICE_UNAVAILABLE);
            } else {
                throw new HttpException('Unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    async addShareholder(shareholderData: any) {
        try {

            const createdShareholder = await createShareholder(shareholderData); // Call the utility function to create the shareholder

            return createdShareholder; // Return the created shareholder
        } catch (error) {
            throw new Error(`Error in creating shareholder: ${error.message}`);
        }
    }


    async getShareholders() {
        try {
            const shareholders = await getShareholders();
            return shareholders;
        } catch (error) {
            throw new Error(`Error fetching shareholders: ${error.message}`);
        }
    }

    async getSignatory() {
        try {
            const signatories = await getSignatories();
            return signatories;
        } catch (error) {
            throw new Error(`Error fetching signatories: ${error.message}`);
        }
    }

    async addSignatory(signatoryData: any) {
        try {

            const createdSignatory = await createSignatory(signatoryData); // Call the utility function to create the shareholder

            return createdSignatory; // Return the created shareholder
        } catch (error) {
            throw new Error(`Error in creating shareholder: ${error.message}`);
        }
    }
    async getBranch() {
        try {
            const branches = await getBranches();
            return branches;
        } catch (error) {
            throw new Error(`Error fetching branches: ${error.message}`);
        }
    }

    async addBranch(branchData: any) {
        try {

            const createdBranch = await createBranch(branchData); // Call the utility function to create the shareholder

            return createdBranch; // Return the created shareholder
        } catch (error) {
            throw new Error(`Error in creating branch: ${error.message}`);
        }
    }
    async getBusiness() {
        try {
            const business = await getBusinesses();
            return business;
        } catch (error) {
            throw new Error(`Error fetching branch: ${error.message}`);
        }
    }

    async addBusiness(branchData: any) {
        try {

            const createdBusiness = await createBusiness(branchData); // Call the utility function to create the shareholder

            return createdBusiness; // Return the created shareholder
        } catch (error) {
            throw new Error(`Error in creating business: ${error.message}`);
        }
    }
    async getBusinessByTRN(trn: any) {
        try {

            const business = await getBusinessData(trn); // Call the utility function to create the shareholder

            return business; // Return the created shareholder
        } catch (error) {
            throw new Error(`Error in fetching business: ${error.message}`);
        }
    }
}
