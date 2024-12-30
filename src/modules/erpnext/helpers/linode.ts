
export async function getLinodeInvoiceData(validLinodeUrl: string, convertExcelToJson: any): Promise<any> {
    try {
        return await convertExcelToJson(validLinodeUrl);
    } catch (error) {
        console.error(`Error fetching Linode data from ${validLinodeUrl}:`, error);
        throw error;
    }
}

export async function validateLinodeUrl(linodeUrls: string): Promise<string | undefined> {
    const linodeUrlsArray = linodeUrls.split(',');

    for (const item of linodeUrlsArray) {
        if (item.startsWith('https://in-maa-1.linodeobjects.com')) {
            return item;  // Return the valid URL
        } else {
            console.log(`Skipping invalid URL: ${item}`);
        }
    }

    return undefined;
}
