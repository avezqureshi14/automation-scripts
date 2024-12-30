import { Injectable } from '@nestjs/common';
import { ApiService } from '../../common/api/api.service';
import axios from 'axios';
import { AppLoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class ErpnextApiService {
    private readonly apiKey = '61489f1fbb59403';
    private readonly apiSecret = '627c14a47e51c0e';
    private readonly erpNextUrl = 'https://avez-taxlab.erpnext.com/';
    private readonly headers = {
        Authorization: `token ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
    };
    private readonly apiService: ApiService;
    private readonly logger: AppLoggerService;
    constructor() {
        const erpNextUrl = 'https://avez-taxlab.erpnext.com/';
        const apiKey = '61489f1fbb59403';
        const apiSecret = '627c14a47e51c0e';

        // Initialize the ApiService with ERPNext details
        this.apiService = new ApiService(erpNextUrl, apiKey, apiSecret);
    }


    async fetchInvoiceDetails(invoiceIdOrName: string): Promise<any> {
        return await this.apiService.request(`/api/resource/Invoices/${invoiceIdOrName}`, 'GET');
    }

    //   to fetch business details by name
    async fetchBusinessDetails(businessName) {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Business/${businessName}`, {
                headers: this.headers
            });
            return response?.data?.data || null;
        } catch (error) {
            console.error(`Error fetching business details for name ${businessName}:`, error?.response?.data || error.message);
            return null;
        }
    }

    //   to fetch all businesses and check for grouptrnumber
    async fetchBusinessByGroupTrn(groupTrn: string): Promise<any> {
        try {
            // Step 1: Fetch all businesses
            const fetchResponse = await axios.get(`${this.erpNextUrl}/api/resource/Business`, {
                headers: this.headers
            });

            const matchingBusinessIds = []; // Array to store matching business IDs

            // Step 2: Loop through each business name and fetch full details
            for (let i = 0; i < fetchResponse.data.data.length; i++) {
                const businessName = fetchResponse.data.data[i].name;

                // Fetch full details for the business
                const business = await this.fetchBusinessDetails(businessName);

                // Step 3: Check if grouptrnumber matches
                if (business && business.grouptrnnumber === groupTrn) {
                    // Step 4: Push matching business ID to the array
                    matchingBusinessIds.push(business.trnnumber); // or any field that represents the business ID
                }
            }

            // Step 5: Return the array of matching business IDs
            if (matchingBusinessIds.length > 0) {
                return matchingBusinessIds;
            } else {
                console.error(`No businesses found with grouptrnumber ${groupTrn}.`);
                return [];
            }

        } catch (error) {
            console.error('Error fetching businesses:', error.response ? error.response.data : error.message);
            return [];
        }
    }

    async fetchInvoicesByFilter(filters): Promise<any> {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Invoices`, {
                params: {
                    filters, // Filters as per ERPNext API
                    limit_start: 0, // Start from the first record
                    limit_page_length: 1000, // Limit the number of records fetched per request
                },
                headers: this.headers
            });
            return response?.data?.data || [];
        } catch (error) {
            console.error('Error fetching invoices with filters:', error?.response?.data || error.message);
            throw new Error('Error fetching invoices');
        }
    }

    async fetchInvoicesByGroupTrn(groupTrn: string, filters) {
        try {
            // Step 1: Fetch business IDs that match the groupTrn
            const matchingBusinessIds = await this.fetchBusinessByGroupTrn(groupTrn);
            if (matchingBusinessIds.length === 0) {
                return [];
            }

            // Step 2: Fetch invoices for each matching business ID
            const allInvoices = [];
            for (let i = 0; i < matchingBusinessIds.length; i++) {
                const businessId = matchingBusinessIds[i];

                // Fetch invoices by business ID
                const invoices = await this.fetchInvoicesByFilter(filters);

                // Add the invoices to the allInvoices array
                allInvoices.push(...invoices);
            }

            // Step 3: Return the combined list of invoices
            return allInvoices;

        } catch (error) {
            console.error('Error fetching invoices by groupTrn:', error.message);
            return [];
        }
    }

    async checkInvoiceExists(invoiceId: string): Promise<boolean> {
        try {
            // Construct the filter to check for existing invoice with the same custom_invoiceid
            const filters = JSON.stringify([
                ['invoiceid', '=', invoiceId]
            ]);

            // Fetch invoices by the filter
            const existingInvoices = await this.fetchInvoicesByFilter(filters);
            // If any invoice with the same custom_invoiceid exists, return true
            if (existingInvoices.length > 0) {
                return true;
            }

            return false; // No matching invoice exists
        } catch (error) {
            console.error('Error checking invoice existence:', error?.response?.data || error.message);
            throw new Error('Error checking invoice existence');
        }
    }

    async fetchInvoiceDetailsForUpdate(invoiceName) {
        console.log("InvoiceName", invoiceName);
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Invoices/${invoiceName}`, {
                headers: this.headers
            });
            return response?.data?.data || null;
        } catch (error) {
            console.error(`Error fetching invoice details for name ${invoiceName}:`, error?.response?.data || error.message);
            return null;
        }
    }

    //  

    //   to fetch all invoices and update the one with the matching invoiceid
    async updateInvoiceInERP(invoiceId: string, linodeobjectkey: any): Promise<any> {
        try {
            // Step 1: Fetch all invoice names
            const fetchResponse = await axios.get(`${this.erpNextUrl}/api/resource/Invoices`, {
                headers: this.headers
            });
            // Step 2: Loop through each invoice name and fetch full details
            for (let i = 0; i < fetchResponse.data.data.length; i++) {
                const invoiceName = fetchResponse.data.data[i].name;

                // Fetch full details for the invoice
                const invoice = await this.fetchInvoiceDetailsForUpdate(invoiceName);
                this.logger.log(invoice);
                if (invoice && invoice.invoiceid === invoiceId) {
                    // Step 4: Update the invoice using the found name
                    const updateResponse = await axios.put(
                        `${this.erpNextUrl}/api/resource/Invoices/${invoiceName}`,
                        {
                            data: {
                                linodeobjectkey: linodeobjectkey,
                            }
                        },
                        { headers: this.headers }
                    );

                    // Log success message
                    return updateResponse.data;
                }
            }

            // If no matching invoice is found
            console.error(`Invoice with invoiceid ${invoiceId} not found.`);
        } catch (error) {
            console.error('Error updating invoice:', error.response ? error.response.data : error.message);
        }
    }

    // Get all Businesses
    async getBusinesses(): Promise<any[]> {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Business`, {
                headers: this.headers, params: {
                    fields: JSON.stringify(['*'])  // Fetch all fields
                }
            });
            return response?.data?.data || [];
        } catch (error) {
            console.error('Error fetching businesses:', error?.response?.data || error.message);
            throw new Error('Error fetching businesses');
        }
    }

    // Create a new Branch


    // Get all Branches
    async getBranches(): Promise<any[]> {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Branches`, {
                headers: this.headers, params: {
                    fields: JSON.stringify(['*'])  // Fetch all fields
                }
            });
            return response?.data?.data || [];
        } catch (error) {
            console.error('Error fetching branches:', error?.response?.data || error.message);
            throw new Error('Error fetching branches');
        }
    }

    // Create a new Signatory

    // Get all Signatories
    async getSignatories(): Promise<any[]> {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Signatories`, {
                headers: this.headers, params: {
                    fields: JSON.stringify(['*'])  // Fetch all fields
                }
            });
            return response?.data?.data || [];
        } catch (error) {
            console.error('Error fetching signatories:', error?.response?.data || error.message);
            throw new Error('Error fetching signatories');
        }
    }

    // Create a new Shareholder
    async checkShareholderExists(shareholderId: string): Promise<boolean> {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Shareholders`, {
                headers: this.headers,
                params: {
                    filters: JSON.stringify([['shareholderid', '=', shareholderId]]),
                    fields: JSON.stringify(['name']), // Only fetch the name field to check existence
                }
            });
            return response?.data?.data?.length > 0; // Return true if shareholder exists
        } catch (error) {
            console.error('Error checking shareholder existence:', error?.response?.data || error.message);
            throw new Error('Error checking shareholder existence');
        }
    }

    //   to create a unique shareholder ID
    async generateUniqueShareholderId(): Promise<string> {
        let uniqueId: string;
        let exists: boolean;

        do {
            // Generate a random shareholder ID or create a strategy to generate the ID
            uniqueId = (Math.floor(Math.random() * 10000) + 1).toString(); // Example random ID generation
            exists = await this.checkShareholderExists(uniqueId); // Check if ID exists in the DB
        } while (exists); // Repeat until the ID is unique

        return uniqueId;
    }

    //   to create a shareholder with a unique ID

    // Get all Shareholders
    async getShareholders(): Promise<any[]> {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Shareholders`, {
                headers: this.headers, params: {
                    fields: JSON.stringify(['*'])  // Fetch all fields
                }
            });
            return response?.data?.data || [];
        } catch (error) {
            console.error('Error fetching shareholders:', error?.response?.data || error.message);
            throw new Error('Error fetching shareholders');
        }
    }


    async createShareholder(shareholderData: any): Promise<any> {
        try {
            // Generate a unique shareholder ID
            const uniqueShareholderId = await this.generateUniqueShareholderId();

            // Add the unique shareholder ID to the shareholder data
            const shareholderDataWithId = { ...shareholderData, shareholderid: uniqueShareholderId };

            // Proceed to create the shareholder with the unique ID
            const response = await axios.post(`${this.erpNextUrl}/api/resource/Shareholders`, shareholderDataWithId, { headers: this.headers });
            return response?.data?.data || null;
        } catch (error) {
            console.error('Error creating shareholder:', error?.response?.data || error.message);
            throw new Error('Error creating shareholder');
        }
    }

    // Create a signatory with a unique ID
    async createSignatory(signatoryData: any): Promise<any> {
        try {
            // Generate a unique signatory ID
            const uniqueSignatoryId = await this.generateUniqueId('Signatories', 'authorizedsignatoryid');

            // Add the unique signatory ID to the data
            const signatoryDataWithId = { ...signatoryData, authorizedsignatoryid: uniqueSignatoryId };

            // Proceed to create the signatory with the unique ID
            const response = await axios.post(`${this.erpNextUrl}/api/resource/Signatories`, signatoryDataWithId, { headers: this.headers });
            return response?.data?.data || null;
        } catch (error) {
            console.error('Error creating signatory:', error?.response?.data || error.message);
            throw new Error('Error creating signatory');
        }
    }

    // Create a branch with a unique ID
    async createBranch(branchData: any): Promise<any> {
        try {
            // Generate a unique branch ID
            const uniqueBranchId = await this.generateUniqueId('Branches', 'branchid');

            // Add the unique branch ID to the data
            const branchDataWithId = { ...branchData, branchid: uniqueBranchId };

            // Proceed to create the branch with the unique ID
            const response = await axios.post(`${this.erpNextUrl}/api/resource/Branches`, branchDataWithId, { headers: this.headers });
            return response?.data?.data || null;
        } catch (error) {
            console.error('Error creating branch:', error?.response?.data || error.message);
            throw new Error('Error creating branch');
        }
    }



    // Create a business with a unique ID
    async createBusiness(businessData: any): Promise<any> {
        try {
            // Generate a unique business ID
            const uniqueBusinessId = await this.generateUniqueId('Business', 'trnnumber');

            // Add the unique business ID to the data
            const businessDataWithId = { ...businessData, trnnumber: uniqueBusinessId };

            // Proceed to create the business with the unique ID
            const response = await axios.post(`${this.erpNextUrl}/api/resource/Business`, businessDataWithId, { headers: this.headers });
            return response?.data?.data || null;
        } catch (error) {
            console.error('Error creating business:', error?.response?.data || error.message);
            throw new Error('Error creating business');
        }
    }

    // Utility   to check if the given ID exists for a specific resource
    async checkIfIdExists(resource: string, idField: string, idValue: string): Promise<boolean> {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/${resource}`, {
                headers: this.headers,
                params: {
                    filters: JSON.stringify([[idField, '=', idValue]]),
                    fields: JSON.stringify(['name']), // Only fetch the name field to check existence
                }
            });
            return response?.data?.data?.length > 0; // Return true if resource with this ID exists
        } catch (error) {
            console.error(`Error checking ${resource} existence:`, error?.response?.data || error.message);
            throw new Error(`Error checking ${resource} existence`);
        }
    }

    // Utility   to generate a unique ID for a given resource
    async generateUniqueId(resource: string, idField: string): Promise<string> {
        let uniqueId: string;
        let exists: boolean;

        do {
            // Generate a 15-digit random unique ID
            uniqueId = Math.random().toString().slice(2, 17); // Generate a 15-digit random number as string

            exists = await this.checkIfIdExists(resource, idField, uniqueId); // Check if ID exists in the DB
        } while (exists); // Repeat until the ID is unique

        return uniqueId;
    }

    async getBusinessByTrnNumber(trnNumber: string): Promise<any> {
        try {
            const filters = JSON.stringify([['trnnumber', '=', trnNumber]]);

            // Step 1: Fetch business details
            const response = await axios.get(`${this.erpNextUrl}/api/resource/Business`, {
                headers: this.headers,
                params: {
                    filters: filters,
                    fields: JSON.stringify(['*'])  // Fetch all fields for the business
                }
            });

            const businessData = response?.data?.data || [];

            if (businessData.length === 0) {
                return {};
            }

            const business = businessData[0];  // Assuming only one result based on TRN

            // Step 2: Fetch details for authorized signatories, shareholders, and branches
            const authorizedSignatoriesIds = business.authorizedsignatories.split(',').map(id => id.trim());
            const shareholdersIds = business.shareholders.split(',').map(id => id.trim());
            const branchesIds = business.branches.split(',').map(id => id.trim());

            // Fetch signatories, shareholders, and branches based on IDs
            const signatories = await this.getDetailsByIds(authorizedSignatoriesIds, 'Signatories', 'authorizedsignatoryid');
            const shareholders = await this.getDetailsByIds(shareholdersIds, 'Shareholders', 'shareholderid');
            const branches = await this.getDetailsByIds(branchesIds, 'Branches', 'branchid');

            // Step 3: Transform the data into the desired format
            return {
                businessName: business.businessname,
                trnNumber: business.trnnumber,
                taxEntity: business.taxentity || 'N/A',
                establishment: business.establishment,
                designatedZone: business.designatedzone,
                description: business.description || 'N/A',
                businessContact: business.businesscontact || 'N/A',
                businessEmail: business.businessemail || 'N/A',
                businessLocation: business.businesslocation,
                businessType: business.businesstype,
                industry: business.industry,
                products: business.products,
                headOffice: business.headoffice,
                authorizedSignatories: signatories.map((signatory: any) => ({
                    authorizedSignatoryName: signatory.authorizedsignatoryname,
                    authorizedSignatoryEmailId: signatory.authorizedsignatoryemailid || 'N/A',
                    authorizedSignatoryDesignation: signatory.authorizedsignatorydesignation || 'N/A',
                    authorizedSignatoryStatus: signatory.authorizedsignatorystatus || 'N/A'
                })),
                shareholders: shareholders.map((shareholder: any) => ({
                    shareholderName: shareholder.shareholdername,
                    shareholderNumber: shareholder.shareholdernumber,
                    numberOfSharesHeld: shareholder.numberofsharesheld,
                    percentageOfTotalNumberOfSharesIssued: shareholder.percentageoftotalnumberofsharesissued
                })),
                branches: branches.map((branch: any) => ({
                    branchLocation: branch.branchlocation,
                    branchEmail: branch.branchemail || 'N/A',
                    branchContact: branch.branchcontact || 'N/A',
                    branchProducts: branch.branchproducts || 'N/A'
                }))
            };

        } catch (error) {
            console.error(`Error fetching business by TRN number ${trnNumber}:`, error?.response?.data || error.message);
            throw new Error('Error fetching business by TRN number');
        }
    }

    // Helper   to fetch details by IDs for signatories, shareholders, and branches
    async getDetailsByIds(ids: string[], type: string, filterField: string): Promise<any> {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/${type}`, {
                headers: this.headers,
                params: {
                    filters: JSON.stringify([[filterField, 'in', ids]]), // Filter by the specific ID field for each entity
                    fields: JSON.stringify(['*'])  // Fetch all fields for the specified type
                }
            });

            return response?.data?.data || [];
        } catch (error) {
            console.error(`Error fetching ${type} details:`, error?.response?.data || error.message);
            return [];
        }
    }


    async fetchDataFromERP(doctype, filters = {}) {
        try {
            const response = await axios.get(
                `${this.erpNextUrl}/api/resource/${doctype}`,
                {
                    params: filters,
                    headers: this.headers
                }
            );
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching data for ${doctype}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async fetchDocDetails(name, doctype) {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/${doctype}/${name}`, {
                headers: this.headers
            });
            return response?.data?.data || null;
        } catch (error) {
            console.error(`Error fetching ${doctype} details for ID ${name}:`, error?.response?.data || error.message);
            return null;
        }
    }

    //   to fetch all shareholders for a given business
    async fetchShareholdersForBusiness(business) {
        const shareholders = await this.fetchDataFromERP('Shareholders', { filters: { businessid: business.trnnumber } });
        return Promise.all(shareholders.map(async (shareholder) => {
            return this.fetchDocDetails(shareholder.name, 'Shareholders');
        }));
    }

    excludeUnwantedFields = (data) => {
        const fieldsToRemove = ["name", "owner", "creation", "modified", "modified_by", "docstatus", "idx"];

        if (Array.isArray(data)) {
            return data.map(item => this.excludeUnwantedFields(item)); // Apply recursively to each array element
        } else if (typeof data === "object" && data !== null) {
            return Object.keys(data)
                .filter(key => !fieldsToRemove.includes(key))  // Filter out unwanted fields
                .reduce((result, key) => {
                    result[key] = this.excludeUnwantedFields(data[key]);  // Recursively clean nested objects or arrays
                    return result;
                }, {});
        } else {
            return data;  // Return the data as is if it's not an object or array
        }
    }

    //   to fetch all signatories for a given business
    async fetchSignatoriesForBusiness(business) {
        const signatories = await this.fetchDataFromERP('Signatories', { filters: { businessid: business.trnnumber } });
        return Promise.all(signatories.map(async (signatory) => {
            return this.fetchDocDetails(signatory.name, 'Signatories');
        }));
    }

    //   to fetch all branches for a given business
    async fetchBranchesForBusiness(business) {
        const branches = await this.fetchDataFromERP('Branches', { filters: { businessid: business.trnnumber } });
        return Promise.all(branches.map(async (branch) => {
            return this.fetchDocDetails(branch.name, 'Branches');
        }));
    }

    async getBusinessDataByGroup(groupTrnNumber) {
        try {
            const taxGroup = await this.fetchDataFromERP('TaxGroup', { filters: { groupTRN: groupTrnNumber } });
            const taxGroupDetails = await this.fetchDocDetails(taxGroup[0].name, 'TaxGroup');
            const businesses = await this.fetchDataFromERP('Business', { filters: { grouptrnnumber: taxGroupDetails.grouptrn } });

            // Fetch business details
            const businessDetails = await Promise.all(
                businesses.map(async (business) => {
                    const businessData = await this.fetchDocDetails(business.name, 'Business');

                    // Fetch shareholders, signatories, and branches for the business
                    const shareholders = await this.fetchShareholdersForBusiness(businessData);
                    const signatories = await this.fetchSignatoriesForBusiness(businessData);
                    const branches = await this.fetchBranchesForBusiness(businessData);

                    return {
                        ...businessData,
                        shareholders,  // Adding the shareholders data
                        signatories,   // Adding the signatories data
                        branches       // Adding the branches data
                    };
                })
            );

            // Prepare the final data format as requested
            const result = {
                groupTRN: taxGroupDetails.grouptrn,
                groupName: taxGroupDetails.groupname,
                taxEntity: taxGroupDetails.taxentity,
                representativeEntity: taxGroupDetails.representativeentity,
                businesses: businessDetails,
            };

            return this.excludeUnwantedFields(result);
        } catch (error) {
            console.error("Error fetching business data:", error.message);
            throw error;
        }
    }

    // Helper   to fetch record details by doctype and name
    async fetchRecordDetails(doctype, recordName) {
        try {
            const response = await axios.get(`${this.erpNextUrl}/api/resource/${doctype}/${recordName}`, { headers: this.headers });
            return response?.data?.data || null;
        } catch (error) {
            console.error(`Error fetching ${doctype} details for name ${recordName}:`, error?.response?.data || error.message);
            return null;
        }
    }

    //   to fetch business data based on groupTrn
    async fetchBusinessData(groupTrn) {
        try {
            const fetchResponse = await axios.get(`${this.erpNextUrl}/api/resource/Business`, { headers: this.headers });
            const businesses = [];

            for (let i = 0; i < fetchResponse.data.data.length; i++) {
                const recordName = fetchResponse.data.data[i].name;
                const record = await this.fetchRecordDetails("Business", recordName);

                if (record && record.grouptrnnumber === groupTrn) {
                    businesses.push(record);
                }
            }

            if (businesses.length === 0) {
                console.error(`No businesses matched with groupTrn ${groupTrn}.`);
            }
            return businesses;
        } catch (error) {
            console.log(error);
            console.error("Error fetching Business details:", error.response?.data || error.message);
        }
    }

    //   to fetch related entities for business
    async fetchRelatedEntitiesForBusiness(business) {
        try {
            const shareholders = await this.fetchDetailsForDoctype("Shareholders", business.name);
            const signatories = await this.fetchDetailsForDoctype("Signatories", business.name);
            const branches = await this.fetchDetailsForDoctype("Branches", business.name);
            return { shareholders, signatories, branches };
        } catch (error) {
            console.error("Error fetching related entities:", error.message);
            return { shareholders: [], signatories: [], branches: [] };
        }
    }

    //   to fetch details for a specific doctype with business ID filter
    async fetchDetailsForDoctype(doctype, businessId) {
        try {
            const fetchResponse = await axios.get(`${this.erpNextUrl}/api/resource/${doctype}`, { headers: this.headers });
            const records = fetchResponse.data.data.filter(record => record.business_id === businessId);
            return records.map(record => this.fetchRecordDetails(doctype, record.name));
        } catch (error) {

            console.error(`Error fetching ${doctype} details:`, error.response?.data || error.message);
            return [];
        }
    }

    async getBusinessData(groupTrn: string): Promise<any> {
        try {
            const businesses = await this.fetchBusinessData(groupTrn);

            if (!businesses || businesses.length === 0) {
                console.error("No business data found.");
                return;
            }

            const group = {
                groupTRN: groupTrn,
                groupName: businesses[0].groupname,
                taxEntity: businesses[0].taxentity,
                businesses: [],
            };

            for (let business of businesses) {
                const { shareholders, signatories, branches } = await this.fetchRelatedEntitiesForBusiness(business);

                group.businesses.push({
                    ...business,
                    shareholders,
                    signatories,
                    branches,
                });
            }

            return [group];
        } catch (error) {
            console.error("Error during the process:", error.message);
        }
    }


}