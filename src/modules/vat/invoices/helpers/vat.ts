export function vatCheck(data: Record<string, string>): Record<string, boolean> {
    const validationResults: Record<string, boolean> = {};
    // for understanding why i have excluded this values from vat check, u can go through the vat.txt file once which i have included in same directory
    const exemptVatKeys = ['vatAmount2', 'vatAmount3', 'vatAmount4', 'vatAmount5', 'vatAmount7', 'vatAmount12', 'vatAmount13', 'vatAmount14'];

    for (const key in data) {
        if (key.startsWith('amount') && data[key]) {
            const amount = parseFloat(data[key]);
            const vatKey = `vatAmount${key.slice(6)}`;
            const vatAmount = parseFloat(data[vatKey]);

            if (exemptVatKeys.includes(vatKey)) {
                // Skip validation for exempt or non-taxable fields
                validationResults[vatKey] = true;
            } else if (!isNaN(amount) && !isNaN(vatAmount) && amount > 0) {
                const calculatedVatPercentage = (vatAmount / amount) * 100;
                const isVatValid = Math.abs(calculatedVatPercentage - 5) <= 0.05;
                const expectedVat = (amount * 5) / 100;
                console.log(`Expected VAT (5% of Amount):`, expectedVat.toFixed(2));
                console.log(`Actual VAT Percentage:`, calculatedVatPercentage.toFixed(2));
                console.log(`VAT Validation Result for ${vatKey}:`, isVatValid);

                validationResults[vatKey] = isVatValid;
            } else {
                validationResults[vatKey] = false;
            }
        }
    }

    return validationResults;
}


export function checkPositiveAmounts(data: Record<string, string>): Record<string, boolean> {
    const positiveAmountCheckResults: Record<string, boolean> = {};

    for (const key in data) {
        if (key.startsWith('amount') && data[key]) {
            const amount = parseFloat(data[key]);
            positiveAmountCheckResults[key] = amount >= 0;
        }
    }

    return positiveAmountCheckResults;
}

// Function to check if invoice date is within a selected range
export function checkInvoiceDate(invoiceDate: string, startDate: string, endDate: string): boolean {
    const invoiceDateObj = new Date(invoiceDate);
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    return invoiceDateObj >= startDateObj && invoiceDateObj <= endDateObj;
}

// Function to check if invoiceId is 15 digits
export function checkInvoiceId(invoiceId: string): boolean {
    return /^\d{15}$/.test(invoiceId);  // regex for exactly 15 digits
}


export function mapResponseForVatCheck(responseData: any): Record<string, string> {
    if (responseData?.data?.[0]?.data) {
        return responseData.data[0].data;
    } else {
        throw new Error("Invalid responseData format");
    }
}


export function extractVatData(parsedData: any) {
    return {
        // VAT on Sales and all other Outputs
        amount1a: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1a_Standard_rated_supplies_in_Abu_Dhabi", "Amount_AED"),
        vatAmount1a: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1a_Standard_rated_supplies_in_Abu_Dhabi", "VAT_Amount_AED"),
        adjustment1a: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1a_Standard_rated_supplies_in_Abu_Dhabi", "Adjustment_Amount_AED"),

        amount1b: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1b_Standard_rated_supplies_in_Dubai", "Amount_AED"),
        vatAmount1b: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1b_Standard_rated_supplies_in_Dubai", "VAT_Amount_AED"),
        adjustment1b: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1b_Standard_rated_supplies_in_Dubai", "Adjustment_Amount_AED"),

        amount1c: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1c_Standard_rated_supplies_in_Sharjah", "Amount_AED"),
        vatAmount1c: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1c_Standard_rated_supplies_in_Sharjah", "VAT_Amount_AED"),
        adjustment1c: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1c_Standard_rated_supplies_in_Sharjah", "Adjustment_Amount_AED"),

        amount1d: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1d_Standard_rated_supplies_in_Ajman", "Amount_AED"),
        vatAmount1d: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1d_Standard_rated_supplies_in_Ajman", "VAT_Amount_AED"),
        adjustment1d: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1d_Standard_rated_supplies_in_Ajman", "Adjustment_Amount_AED"),

        amount1e: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1e_Standard_rated_supplies_in_Umm_Al_Quwain", "Amount_AED"),
        vatAmount1e: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1e_Standard_rated_supplies_in_Umm_Al_Quwain", "VAT_Amount_AED"),
        adjustment1e: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1e_Standard_rated_supplies_in_Umm_Al_Quwain", "Adjustment_Amount_AED"),

        amount1f: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1f_Standard_rated_supplies_in_Ras_Al_Khaimah", "Amount_AED"),
        vatAmount1f: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1f_Standard_rated_supplies_in_Ras_Al_Khaimah", "VAT_Amount_AED"),
        adjustment1f: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1f_Standard_rated_supplies_in_Ras_Al_Khaimah", "Adjustment_Amount_AED"),

        amount1g: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1g_Standard_rated_supplies_in_Fujairah", "Amount_AED"),
        vatAmount1g: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1g_Standard_rated_supplies_in_Fujairah", "VAT_Amount_AED"),
        adjustment1g: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1g_Standard_rated_supplies_in_Fujairah", "Adjustment_Amount_AED"),

        amount2: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.2_Tax_refunds_provided_to_tourists", "Amount_AED"),
        vatAmount2: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.2_Tax_refunds_provided_to_tourists", "VAT_Amount_AED"),

        amount3: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.3_Supplies_subject_to_reverse_charge_provisions", "Amount_AED"),
        vatAmount3: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.3_Supplies_subject_to_reverse_charge_provisions", "VAT_Amount_AED"),

        amount4: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.4_Zero_rated_supplies", "Amount_AED"),
        amount5: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.5_Exempt_supplies", "Amount_AED"),

        amount6: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.6_Goods_imported_into_the_UAE", "Amount_AED"),
        vatAmount6: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.6_Goods_imported_into_the_UAE", "VAT_Amount_AED"),

        amount7: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.7_Adjustments_to_goods_imported_into_the_UAE", "Amount_AED"),
        vatAmount7: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.7_Adjustments_to_goods_imported_into_the_UAE", "VAT_Amount_AED"),
        adjustment7: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.7_Adjustments_to_goods_imported_into_the_UAE", "Adjustment_Amount_AED"),

        totalAmount8: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.8_Totals", "Amount_AED"),
        totalVatAmount8: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.8_Totals", "VAT_Amount_AED"),
        totalAdjustment8: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.8_Totals", "Adjustment_Amount_AED"),

        // VAT on Expenses and all other Inputs
        amount9: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.9_Standard_rated_expenses", "Amount_AED"),
        vatAmount9: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.9_Standard_rated_expenses", "Recoverable_VAT_amount_AED"),
        adjustment9: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.9_Standard_rated_expenses", "Adjustment_Amount_AED"),

        amount10: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.10_Supplies_subject_to_reverse_charge_provisions", "Amount_AED"),
        vatAmount10: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.10_Supplies_subject_to_reverse_charge_provisions", "Recoverable_VAT_amount_AED"),
        adjustment10: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.10_Supplies_subject_to_reverse_charge_provisions", "Adjustment_Amount_AED"),

        totalAmount11: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.11_Totals", "Amount_AED"),
        totalVatAmount11: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.11_Totals", "Recoverable_VAT_amount_AED"),
        totalAdjustment11: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.11_Totals", "Adjustment_Amount_AED"),

        // Net VAT Due
        amount12: getParsedAmount(parsedData, "Net VAT Due.12_Total_value_of_due_tax_for_the_period", "Amount_AED"),
        vatAmount12: getParsedAmount(parsedData, "Net VAT Due.12_Total_value_of_due_tax_for_the_period", "VAT_Amount_AED"),
        adjustment12: getParsedAmount(parsedData, "Net VAT Due.12_Total_value_of_due_tax_for_the_period", "Adjustment_Amount_AED"),

        amount13: getParsedAmount(parsedData, "Net VAT Due.13_Total_Value_of_recoverable_tax_for_the_period", "Amount_AED"),
        vatAmount13: getParsedAmount(parsedData, "Net VAT Due.13_Total_Value_of_recoverable_tax_for_the_period", "VAT_Amount_AED"),
        adjustment13: getParsedAmount(parsedData, "Net VAT Due.13_Total_Value_of_recoverable_tax_for_the_period", "Adjustment_Amount_AED"),

        amount14: getParsedAmount(parsedData, "Net VAT Due.14_Payable_tax_for_the_period", "Amount_AED"),
        vatAmount14: getParsedAmount(parsedData, "Net VAT Due.14_Payable_tax_for_the_period", "VAT_Amount_AED"),
        adjustment14: getParsedAmount(parsedData, "Net VAT Due.14_Payable_tax_for_the_period", "Adjustment_Amount_AED"),

        // Profit Scheme
        profitScheme: getParsedValue(parsedData, "Profit Scheme"),

        //Generated By
        generatedBy: getParsedValue(parsedData, "Invoice Details.GeneratedBy"),

        //Generated On
        generatedOn: getParsedValue(parsedData, "Invoice Details.GeneratedOn")
    };
}




function getParsedValue(parsedData: any, field: string) {
    const keys = field.split(".");
    let result = parsedData;
    for (const key of keys) {
        result = result[key];
        if (result === undefined || result === null) return null;
    }
    return result;
}

function getParsedAmount(data: any, path: string, subField: string = "Amount_AED"): string {
    const keys = path.split(".");
    let current = data;
    for (const key of keys) {
        current = current[key];
        if (current === undefined) {
            return '0'; // If any part of the path is missing, return '0'
        }
    }
    return current[subField]?.toString() ?? '0';
}




export const mapInvoiceData = (inputData: any): any => {
    // Check if data exists and is an array with at least one element
    const { data } = inputData;

    if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Data is missing or empty.');
    }

    // If the check passes, proceed with accessing the first element
    const invoice = data[0].invoice;
    const invoiceData = data[0].data;

    const outputData = [
        {
            Col1: 'Invoice Details',
            Col2: JSON.stringify({
                UUID: invoice.invoiceId,
                ProfileID: 'UAE-VAT12345', // Static for now, can be dynamic if needed
                ID: invoice.invoiceId,
                IssueTime: invoice.createdOn,
                InvoiceTypeCode: 'Tax Invoice',
                DocumentCurrencyCode: 'AED',
                TaxCurrencyCode: 'AED',
                AdditionalDocumentReference: '',
                TaxCategoryID: null,
                TaxCategoryPercent: null,
                TaxCategoryTaxScheme: 'VAT',
            }),
        },
        {
            Col1: 'VAT on Sales and all other Outputs',
            Col2: JSON.stringify({
                '1a_Standard_rated_supplies_in_Abu_Dhabi': {
                    Amount_AED: invoiceData.amount1a,
                    VAT_Amount_AED: Number(invoiceData.amount1a),
                    Adjustment_Amount_AED: invoiceData.adjustment1a,
                },
                '1b_Standard_rated_supplies_in_Dubai': {
                    Amount_AED: invoiceData.amount1b,
                    VAT_Amount_AED: Number(invoiceData.amount1b),
                    Adjustment_Amount_AED: invoiceData.adjustment1b,
                },
                // Continue with the rest of the outputData structure
            }),
        },
        // Continue with the other sections of outputData
    ];

    return { outputData, invoiceId: invoice.invoiceId };
};



// const responseData = {
//     "data": [
//         {
//             "data": {
//                 "amount1a": "50000",
//                 "vatAmount1a": "2500",
//                 "adjustment1a": "0",
//                 "amount1b": "75000",
//                 "vatAmount1b": "3750",
//                 "adjustment1b": "0",
//                 "amount1c": "25000",
//                 "vatAmount1c": "1250",
//                 "adjustment1c": "0",
//                 "amount1d": "10000",
//                 "vatAmount1d": "500",
//                 "adjustment1d": "0",
//                 "amount1e": "8000",
//                 "vatAmount1e": "400",
//                 "adjustment1e": "0",
//                 "amount1f": "15000",
//                 "vatAmount1f": "750",
//                 "adjustment1f": "0",
//                 "amount1g": "5000",
//                 "vatAmount1g": "250",
//                 "adjustment1g": "0",
//                 "amount2": "0",
//                 "vatAmount2": "0",
//                 "amount3": "20000",
//                 "vatAmount3": "0",
//                 "amount4": "12000",
//                 "amount5": "6000",
//                 "amount6": "30000",
//                 "vatAmount6": "1500",
//                 "amount7": "0",
//                 "vatAmount7": "0",
//                 "adjustment7": "0",
//                 "totalAmount8": "246000",
//                 "totalVatAmount8": "12300",
//                 "totalAdjustment8": "0",
//                 "amount9": "40000",
//                 "vatAmount9": "2000",
//                 "adjustment9": "0",
//                 "amount10": "15000",
//                 "vatAmount10": "750",
//                 "adjustment10": "0",
//                 "totalAmount11": "55000",
//                 "totalVatAmount11": "2750",
//                 "totalAdjustment11": "0",
//                 "amount12": "12300",
//                 "vatAmount12": "0",
//                 "adjustment12": "0",
//                 "amount13": "2750",
//                 "vatAmount13": "0",
//                 "adjustment13": "0",
//                 "amount14": "9550",
//                 "vatAmount14": "0",
//                 "adjustment14": "0",
//                 "profitScheme": true
//             },
//             "invoice": {
//                 "businessId": "100023129800003",
//                 "invoiceId": "8d8bfbfd0dd7c4750082d72e",
//                 "fileType": "invoice",
//                 "source": "api",
//                 "IRNstatus": "Generated",
//                 "linodeObjectKey": "https://in-maa-1.linodeobjects.com/einvoice-bucket/Invoice_Data_20241120041745.xlsx",
//                 "documentType": "invoice"
//             },
//             "errors": {}
//         }
//     ],
//     "message": "Successful",
//     "code": "200",
//     "errors": null,
//     "page": {
//         "previous": null,
//         "current": "1",
//         "next": null,
//         "total": 1,
//         "size": "3",
//         "records": {
//             "total": 1,
//             "onPage": 1
//         }
//     }
// }