import { mapInvoiceData } from "./vatData";

export function buildFilters(orgName: string, startDate: string, endDate: string) {
    return JSON.stringify([
        ["company", "=", orgName],
        ["posting_date", "between", [startDate, endDate]]
    ]);
}

export function extractInvoiceNames(responseData: any) {
    return responseData.data?.data ?? [];
}
function convertData(input) {
    const output = [];

    input.forEach(item => {
        const section = item.Col1;
        const data = typeof item.Col2 === 'string' ? JSON.parse(item.Col2) : item.Col2;

        switch (section) {
            case 'Invoice Details':
                for (const [key, value] of Object.entries(data)) {
                    output.push([key, value !== null ? value : ""]);
                }
                output.push([]); // Add an empty row after Invoice Details
                break;

            case 'VAT on Sales and all other Outputs':
                output.push([section]);
                output.push(["", "Amount (AED)", "VAT Amount (AED)", "Adjustment Amount (AED)"]);
                for (const [key, values] of Object.entries(data)) {
                    output.push([
                        //@ts-expect-error
                        key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()), values.Amount_AED || "", values.VAT_Amount_AED || "", values.Adjustment_Amount_AED || ""
                    ]);
                }
                output.push([]); // Add an empty row after this section
                break;

            case 'VAT on Expenses and all other Inputs':
                output.push([section]);
                output.push(["", "Amount (AED)", "Recoverable VAT amount (AED)", "Adjustment Amount (AED)"]);
                for (const [key, values] of Object.entries(data)) {
                    output.push([
                        //@ts-expect-error
                        key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()), values.Amount_AED || "", values.Recoverable_VAT_amount_AED || "", values.Adjustment_Amount_AED || ""
                    ]);
                }
                output.push([]); // Add an empty row after this section
                break;

            case 'Net VAT Due':
                output.push([section]);
                for (const [key, values] of Object.entries(data)) {
                    output.push([
                        //@ts-expect-error
                        key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()), values.Amount_AED || ""
                    ]);
                }
                output.push([]); // Add an empty row after this section
                break;

            case 'Profit Scheme':
                output.push([section, data.toString().toUpperCase()]);
                break;

            default:
                break;
        }
    });

    return output;
}
export async function processInvoiceUpdate(invoiceData: any, generateExcel) {
    const { outputData, invoiceId } = mapInvoiceData(invoiceData);
    const convertedData = convertData(outputData);
    const filePath = generateExcel(convertedData);
    return { filePath, invoiceId }
}