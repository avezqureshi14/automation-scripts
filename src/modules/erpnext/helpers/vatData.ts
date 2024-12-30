import { checkInvoiceExists } from "../utils/httpUtils";


export function extractVatData(parsedData: any, validLinodeUrl: string) {
    return {
        // VAT on Sales and all other Outputs
        amount1a: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1a_Standard_rated_supplies_in_Abu_Dhabi.Amount_AED"),
        vatAmount1a: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1a_Standard_rated_supplies_in_Abu_Dhabi.VAT_Amount_AED"),
        adjustment1a: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1a_Standard_rated_supplies_in_Abu_Dhabi.Adjustment_Amount_AED"),

        amount1b: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1b_Standard_rated_supplies_in_Dubai.Amount_AED"),
        vatAmount1b: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1b_Standard_rated_supplies_in_Dubai.VAT_Amount_AED"),
        adjustment1b: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1b_Standard_rated_supplies_in_Dubai.Adjustment_Amount_AED"),

        amount1c: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1c_Standard_rated_supplies_in_Sharjah.Amount_AED"),
        vatAmount1c: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1c_Standard_rated_supplies_in_Sharjah.VAT_Amount_AED"),
        adjustment1c: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1c_Standard_rated_supplies_in_Sharjah.Adjustment_Amount_AED"),

        amount1d: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1d_Standard_rated_supplies_in_Ajman.Amount_AED"),
        vatAmount1d: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1d_Standard_rated_supplies_in_Ajman.VAT_Amount_AED"),
        adjustment1d: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1d_Standard_rated_supplies_in_Ajman.Adjustment_Amount_AED"),

        amount1e: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1e_Standard_rated_supplies_in_Umm_Al_Quwain.Amount_AED"),
        vatAmount1e: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1e_Standard_rated_supplies_in_Umm_Al_Quwain.VAT_Amount_AED"),
        adjustment1e: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1e_Standard_rated_supplies_in_Umm_Al_Quwain.Adjustment_Amount_AED"),

        amount1f: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1f_Standard_rated_supplies_in_Ras_Al_Khaimah.Amount_AED"),
        vatAmount1f: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1f_Standard_rated_supplies_in_Ras_Al_Khaimah.VAT_Amount_AED"),
        adjustment1f: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1f_Standard_rated_supplies_in_Ras_Al_Khaimah.Adjustment_Amount_AED"),

        amount1g: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1g_Standard_rated_supplies_in_Fujairah.Amount_AED"),
        vatAmount1g: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1g_Standard_rated_supplies_in_Fujairah.VAT_Amount_AED"),
        adjustment1g: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.1g_Standard_rated_supplies_in_Fujairah.Adjustment_Amount_AED"),

        amount2: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.2_Tax_refunds_provided_to_tourists.Amount_AED"),
        vatAmount2: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.2_Tax_refunds_provided_to_tourists.VAT_Amount_AED"),

        amount3: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.3_Supplies_subject_to_reverse_charge_provisions.Amount_AED"),
        vatAmount3: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.3_Supplies_subject_to_reverse_charge_provisions.VAT_Amount_AED"),

        amount4: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.4_Zero_rated_supplies.Amount_AED"),
        amount5: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.5_Exempt_supplies.Amount_AED"),

        amount6: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.6_Goods_imported_into_the_UAE.Amount_AED"),
        vatAmount6: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.6_Goods_imported_into_the_UAE.VAT_Amount_AED"),

        amount7: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.7_Adjustments_to_goods_imported_into_the_UAE.Amount_AED"),
        vatAmount7: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.7_Adjustments_to_goods_imported_into_the_UAE.VAT_Amount_AED"),
        adjustment7: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.7_Adjustments_to_goods_imported_into_the_UAE.Adjustment_Amount_AED"),

        totalAmount8: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.8_Totals.Amount_AED"),
        totalVatAmount8: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.8_Totals.VAT_Amount_AED"),
        totalAdjustment8: getParsedAmount(parsedData, "VAT on Sales and all other Outputs.8_Totals.Adjustment_Amount_AED"),

        // VAT on Expenses and all other Inputs
        amount9: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.9_Standard_rated_expenses.Amount_AED"),
        vatAmount9: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.9_Standard_rated_expenses.Recoverable_VAT_amount_AED"),
        adjustment9: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.9_Standard_rated_expenses.Adjustment_Amount_AED"),

        amount10: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.10_Supplies_subject_to_reverse_charge_provisions.Amount_AED"),
        vatAmount10: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.10_Supplies_subject_to_reverse_charge_provisions.Recoverable_VAT_amount_AED"),
        adjustment10: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.10_Supplies_subject_to_reverse_charge_provisions.Adjustment_Amount_AED"),

        totalAmount11: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.11_Totals.Amount_AED"),
        totalVatAmount11: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.11_Totals.Recoverable_VAT_amount_AED"),
        totalAdjustment11: getParsedAmount(parsedData, "VAT on Expenses and all other Inputs.11_Totals.Adjustment_Amount_AED"),

        // Net VAT Due
        amount12: getParsedAmount(parsedData, "Net VAT Due.12_Total_value_of_due_tax_for_the_period.Amount_AED"),
        vatAmount12: getParsedAmount(parsedData, "Net VAT Due.12_Total_value_of_due_tax_for_the_period.VAT_Amount_AED"),
        adjustment12: getParsedAmount(parsedData, "Net VAT Due.12_Total_value_of_due_tax_for_the_period.Adjustment_Amount_AED"),

        amount13: getParsedAmount(parsedData, "Net VAT Due.13_Total_Value_of_recoverable_tax_for_the_period.Amount_AED"),
        vatAmount13: getParsedAmount(parsedData, "Net VAT Due.13_Total_Value_of_recoverable_tax_for_the_period.VAT_Amount_AED"),
        adjustment13: getParsedAmount(parsedData, "Net VAT Due.13_Total_Value_of_recoverable_tax_for_the_period.Adjustment_Amount_AED"),

        amount14: getParsedAmount(parsedData, "Net VAT Due.14_Payable_tax_for_the_period.Amount_AED"),
        vatAmount14: getParsedAmount(parsedData, "Net VAT Due.14_Payable_tax_for_the_period.VAT_Amount_AED"),
        adjustment14: getParsedAmount(parsedData, "Net VAT Due.14_Payable_tax_for_the_period.Adjustment_Amount_AED"),

        // Profit Scheme
        profitScheme: getParsedValue(parsedData, "Profit Scheme")
    };
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

export const trnToOrgMapping = {
    '100023129800003': '100023129800003',
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

export function generateRandomId(length: number = 24): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

export async function generateUniqueInvoiceId(): Promise<string> {
    let uniqueId = generateRandomId();
    let exists = await checkInvoiceExists(uniqueId);

    while (exists) {
        uniqueId = generateRandomId();
        exists = await checkInvoiceExists(uniqueId);
    }
    return uniqueId;
}

export const mapInvoiceData = (inputData: any): any => {
    const { data } = inputData;
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
                '1c_Standard_rated_supplies_in_Sharjah': {
                    Amount_AED: invoiceData.amount1c,
                    VAT_Amount_AED: Number(invoiceData.amount1c),
                    Adjustment_Amount_AED: invoiceData.adjustment1c,
                },
                '1d_Standard_rated_supplies_in_Ajman': {
                    Amount_AED: invoiceData.amount1d,
                    VAT_Amount_AED: Number(invoiceData.amount1d),
                    Adjustment_Amount_AED: invoiceData.adjustment1d,
                },
                '1e_Standard_rated_supplies_in_Umm_Al_Quwain': {
                    Amount_AED: invoiceData.amount1e,
                    VAT_Amount_AED: Number(invoiceData.amount1e),
                    Adjustment_Amount_AED: invoiceData.adjustment1e,
                },
                '1f_Standard_rated_supplies_in_Ras_Al_Khaimah': {
                    Amount_AED: invoiceData.amount1f,
                    VAT_Amount_AED: Number(invoiceData.amount1f),
                    Adjustment_Amount_AED: invoiceData.adjustment1f,
                },
                '1g_Standard_rated_supplies_in_Fujairah': {
                    Amount_AED: invoiceData.amount1g,
                    VAT_Amount_AED: Number(invoiceData.amount1g),
                    Adjustment_Amount_AED: invoiceData.adjustment1g,
                },
                '2_Tax_refunds_provided_to_tourists': {
                    Amount_AED: invoiceData.amount2,
                    VAT_Amount_AED: 0,
                },
                '3_Supplies_subject_to_reverse_charge_provisions': {
                    Amount_AED: invoiceData.amount3,
                    VAT_Amount_AED: 0, // Set VAT to 0 for reverse charge
                },
                '4_Zero_rated_supplies': { Amount_AED: invoiceData.amount4 },
                '5_Exempt_supplies': { Amount_AED: invoiceData.amount5 },
                '6_Goods_imported_into_the_UAE': {
                    Amount_AED: invoiceData.amount6,
                    VAT_Amount_AED: Number(invoiceData.amount6),
                },
                '7_Adjustments_to_goods_imported_into_the_UAE': {
                    Amount_AED: invoiceData.amount7,
                    VAT_Amount_AED: 0,
                    Adjustment_Amount_AED: invoiceData.adjustment7,
                },
                '8_Totals': {
                    Amount_AED: invoiceData.totalAmount8,
                    VAT_Amount_AED: Number(invoiceData.totalAmount8),
                    Adjustment_Amount_AED: invoiceData.totalAdjustment8,
                },
            }),
        },
        {
            Col1: 'VAT on Expenses and all other Inputs',
            Col2: JSON.stringify({
                '9_Standard_rated_expenses': {
                    Amount_AED: invoiceData.amount9,
                    Recoverable_VAT_amount_AED: Number(invoiceData.amount9),
                    Adjustment_Amount_AED: invoiceData.adjustment9,
                },
                '10_Supplies_subject_to_reverse_charge_provisions': {
                    Amount_AED: invoiceData.amount10,
                    Recoverable_VAT_amount_AED: Number(invoiceData.amount10),
                    Adjustment_Amount_AED: invoiceData.adjustment10,
                },
                '11_Totals': {
                    Amount_AED: invoiceData.totalAmount11,
                    Recoverable_VAT_amount_AED: Number(invoiceData.totalAmount11),
                    Adjustment_Amount_AED: invoiceData.totalAdjustment11,
                },
            }),
        },
        {
            Col1: 'Net VAT Due',
            Col2: JSON.stringify({
                '12_Total_value_of_due_tax_for_the_period': {
                    Amount_AED: Number(invoiceData.totalAmount8),
                    VAT_Amount_AED: 0,
                    Adjustment_Amount_AED: 0, // Matches VAT on outputs
                },
                '13_Total_Value_of_recoverable_tax_for_the_period': {
                    Amount_AED: Number(invoiceData.totalAmount11),
                    VAT_Amount_AED: 0,
                    Adjustment_Amount_AED: 0, // Matches recoverable VAT on inputs
                },
                '14_Payable_tax_for_the_period': {
                    Amount_AED: Number(invoiceData.totalAmount8) - Number(invoiceData.totalAmount11),
                    VAT_Amount_AED: 0,
                    Adjustment_Amount_AED: 0, // Net VAT due after recoverable VAT
                },
            }),
        },
        {
            Col1: 'Profit Scheme',
            Col2: invoiceData.profitScheme.toString(),
        },
    ];
    return { outputData, invoiceId: invoice.invoiceId };
};
