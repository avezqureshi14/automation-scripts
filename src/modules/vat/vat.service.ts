import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VatFiling, VatFilingDocument } from './entity/vat-filing.schema';
import { InvoiceService } from './invoices/invoice.service';

@Injectable()
export class VatService {
    constructor(
        @InjectModel(VatFiling.name) private vatFilingModel: Model<VatFilingDocument>,
        @Inject(forwardRef(() => InvoiceService)) private invoiceService: InvoiceService
    ) { }

    private generateVatFilingId(): string {
        const timestamp = Date.now().toString(); // Get current timestamp
        const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // Generate a 6-digit random number
        return timestamp.slice(-9) + randomPart; // Combine last 9 digits of timestamp and 6-digit random part to form 15-digit ID
    }
    /**
       * Creates a new VAT Filing record in the database.
       * @param dateRange - The range of dates for the filing.
       * @param filingInvoices - The invoices included in the filing.
       * @param failedInvoices - The invoices that failed.
       * @param linodeObjectKey - The key for the Linode object related to the filing.
       * @returns The created VAT Filing record.
       */
    async createVatFiling(
        dateRange: string,
        filingInvoices: string[],
        failedInvoices: string[],
        linodeObjectKey: string,
        status: string
    ): Promise<VatFiling> {
        try {
            // Generate unique 15-digit VAT Filing ID
            const vatFilingId = this.generateVatFilingId();

            // Input validation
            const newFiling = new this.vatFilingModel({
                vatId: vatFilingId, // Assign the generated VAT Filing ID
                dateRange,
                filingInvoices,
                failedInvoices,
                linodeObjectKey,
                status
            });

            // Save and return the newly created filing
            return await newFiling.save();
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error; // Re-throw the validation error
            } else {
                console.error('Error creating VAT Filing:', error);
                throw new InternalServerErrorException('Could not create VAT Filing due to a server error');
            }
        }
    }
    /**
     * Updates an existing VAT Filing record in the database.
     * @param id - The unique identifier (_id) of the VAT Filing record to update.
     * @param updateData - The data to update in the VAT Filing record.
     * @returns The updated VAT Filing record.
     */
    async updateVatFiling(
        id: string,
        updateData: Partial<VatFiling>,
    ): Promise<VatFiling> {
        try {
            // Input validation: Check if ID and data are provided
            if (!id || !updateData) {
                throw new BadRequestException('Missing required parameters: id or update data');
            }

            // Find the VAT Filing by ID
            const vatFiling = await this.vatFilingModel.findOne({ vatId: id });

            // If the record doesn't exist, throw a NotFoundException
            if (!vatFiling) {
                throw new NotFoundException(`VAT Filing with ID ${id} not found`);
            }

            // Update the record with the provided data
            Object.assign(vatFiling, updateData);

            // Save the updated VAT Filing record
            return await vatFiling.save();
        } catch (error) {
            // Handle specific errors
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error; // Re-throw validation or not found errors
            } else {
                console.error('Error updating VAT Filing:', error);
                throw new InternalServerErrorException('Could not update VAT Filing due to a server error');
            }
        }
    }
    /**
    * Retrieves the filingInvoices of a VAT Filing document by its ID.
    * @param vatId - The unique ID of the VAT Filing document.
    * @returns The filingInvoices array from the document with the given ID.
    * @throws NotFoundException if the document is not found.
    * @throws InternalServerErrorException for unexpected errors.
    */
    async getFilingInvoicesByVatId(vatId: string): Promise<string[]> {
        try {
            // Find the document by VAT Filing ID
            const vatFiling = await this.vatFilingModel.findOne({ vatId }).exec();

            // If no document is found, throw a NotFoundException
            if (!vatFiling) {
                throw new NotFoundException(`VAT Filing with ID ${vatId} not found`);
            }

            // Return the filingInvoices array
            return vatFiling.filingInvoices;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error; // Re-throw if it's a NotFoundException
            } else {
                console.error('Error retrieving filingInvoices:', error);
                throw new InternalServerErrorException('Could not retrieve filingInvoices due to a server error');
            }
        }
    }
    private paginateData(data: any[], page: number, size: number): any[] {
        page = Number(page);
        size = Number(size);
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        return data.slice(startIndex, endIndex);
    }

    private getPaginationDetails(totalRecords: number, page: number, size: number): any {
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
                onPage: Math.min(size, totalRecords - (page - 1) * size),
            },
        };
    }

    /**
     * Retrieves paginated VAT Filing records from the database.
     * @param page The page number for pagination.
     * @param size The number of records per page.
     * @returns An object containing the paginated data and pagination details.
     * @throws InternalServerErrorException for unexpected errors.
     */
    async getAllVatFilings(page: number = 1, size: number = 10): Promise<any> {
        try {
            // Fetch all VAT Filing records from the database
            const allFilings = await this.vatFilingModel.find().exec();
            const totalRecords = allFilings.length;

            // Paginate the data
            const paginatedData = this.paginateData(allFilings, page, size);
            const paginationDetails = this.getPaginationDetails(totalRecords, page, size);

            return {
                data: paginatedData,
                pagination: paginationDetails,
            };
        } catch (error) {
            console.error('Error retrieving paginated VAT Filings:', error);
            throw new InternalServerErrorException('Could not retrieve VAT Filings due to a server error');
        }
    }
    async removeInvoice(vatId: string, invoiceId: string): Promise<VatFiling> {
        try {
            const vatFiling = await this.vatFilingModel.findOne({ vatId });

            // If no document is found, throw a NotFoundException
            if (!vatFiling) {
                throw new NotFoundException(`VAT Filing with ID ${vatId} not found`);
            }

            // Ensure failedInvoices is an array, otherwise initialize it as an empty array
            if (!Array.isArray(vatFiling.failedInvoices)) {
                vatFiling.failedInvoices = [];
            }

            // Check if the invoiceId exists in the failedInvoices array
            const index = vatFiling.failedInvoices.indexOf(invoiceId);
            if (index > -1) {
                vatFiling.failedInvoices.splice(index, 1); // Remove the invoiceId
            }

            // Save the updated VAT Filing record
            return await vatFiling.save();
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error; // Re-throw if it's a NotFoundException
            } else {
                console.error('Error removing invoice from failedInvoices:', error);
                throw new InternalServerErrorException('Could not remove invoice due to a server error');
            }
        }
    }
    async getVatFilingByVatId(vatId: string): Promise<{
        data: {
            invoices: any[],
            status: string,
            generalStatus: boolean,
            totalInvoices: number,
            dateRange: string
        }
    }> {
        try {
            const vatFiling = await this.vatFilingModel.findOne({ vatId }).exec();
            if (!vatFiling) {
                throw new NotFoundException(`VAT Filing with ID ${vatId} not found`);
            }

            const invoices = vatFiling.filingInvoices;
            const status = vatFiling.status;
            const dateRange = vatFiling.dateRange;
            const totalInvoices = invoices.length; // Count the invoices

            const structuredInvoices = await Promise.all(
                invoices.map(async (item) => {
                    const validatedInvoice = await this.invoiceService.validateInvoiceById(item);
                    const invoiceDetails = await this.invoiceService.getInvoiceDetailsForSingleInvoice(item);
                    if ('data' in validatedInvoice && validatedInvoice.data.invoice) {
                        const invoice = validatedInvoice.data.invoice;
                        return {
                            invoiceId: invoice.id,
                            isValidated: invoice.isValidated,
                            error: invoice.error || [],
                            generalStatus: invoice.generalStatus || false,
                            checkList: {
                                check1: invoice.checkList?.check1 || false,
                                check2: invoice.checkList?.check2 || false,
                                check3: invoice.checkList?.check3 || false,
                                check4: invoice.checkList?.check4 || false,
                                check5: invoice.checkList?.check5 || false,
                            },
                            isUpdated: invoiceDetails.data?.invoice?.isUpdated,
                            linodeObjectKey: invoiceDetails.data?.invoice?.linodeObjectKey || "",
                        };
                    } else {
                        console.log('error');
                        return null; // Handle invalid invoices
                    }
                })
            );

            // Calculate the `generalStatus` based on the invoices
            const generalStatus = structuredInvoices.every(invoice => invoice?.generalStatus !== false);

            return {
                data: {
                    invoices: structuredInvoices,
                    status,
                    generalStatus,
                    totalInvoices,
                    dateRange
                }
            };
        } catch (error) {
            console.log(error);
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                console.error('Error retrieving VAT Filing:', error);
                throw new InternalServerErrorException('Could not retrieve VAT Filing due to a server error');
            }
        }
    }



    async findVatFilingByDateRange(dateRange: string): Promise<VatFiling | null> {
        return await this.vatFilingModel.findOne({ dateRange }).exec();
    }

    async updateVatFilingByDateRange(vatFiling: any): Promise<any> {
        return await vatFiling.save();
    }


}
