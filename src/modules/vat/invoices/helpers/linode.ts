
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


export async function getFileSizeFromURL(fileURL: string): Promise<number> {
    try {
        const response = await fetch(fileURL, { method: 'HEAD' });
        if (!response.ok) {
            throw new Error(`Unable to fetch file size, status: ${response.status}`);
        }
        const contentLength = response.headers.get('content-length');
        // Convert file size from bytes to kilobytes (KB)
        return contentLength ? Math.ceil(parseInt(contentLength, 10) / 1024) : 0;
    } catch (error) {
        console.error(`Error fetching file size from URL: ${fileURL}`, error);
        throw error;
    }
}
