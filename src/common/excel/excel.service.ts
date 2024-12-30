import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { data } from './helpers/excel.helper';
import { dataTransformation } from './helpers/data-transformation';

class ExcelService {

  public generateExcel(inputData = data): string {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(inputData);

    const baseName = "Invoice_Data";
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
    const sheetName = `${baseName}_${timestamp}`.slice(0, 31);

    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

    const filePath = path.join(__dirname, `${sheetName}.xlsx`);
    xlsx.writeFile(workbook, filePath);

    console.log(
      `Excel file created at ${filePath} with sheet name: ${sheetName}`
    );
    return filePath;
  }

  async convertExcelToJson(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      const workbook = xlsx.read(response.data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jData = xlsx.utils.sheet_to_json(worksheet, { defval: null });
      const result = dataTransformation(jData);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('Error processing the Excel file:', error);
      throw error;
    }
  }


}

export default ExcelService;
