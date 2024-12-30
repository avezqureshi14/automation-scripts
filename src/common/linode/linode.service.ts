import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LinodeService {
  private readonly accessKeyId = 'D650B08TQLQVABPZIJ1P';
  private readonly secretAccessKey = 'oQdXAuUvCS4tqhMbutgFyydCT2H9K6ICgetYpAmC';
  private readonly bucketName = 'einvoice-bucket';
  private readonly endpoint = 'https://in-maa-1.linodeobjects.com/';
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: this.endpoint,
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      s3ForcePathStyle: true,
    });
  }

  async uploadFile(filePath: string): Promise<string> {
    if (!filePath) {
      console.error('Error: File path is undefined or null.');
      throw new Error('File path is undefined or null.');
    }

    const fileName = path.basename(filePath);

    if (!fs.existsSync(filePath)) {
      console.error(`Error: File does not exist at path: ${filePath}`);
      throw new Error(`File does not exist: ${filePath}`);
    }

    const fileData = fs.readFileSync(filePath);

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileData,
      ContentType: this.getContentType(fileName),
      ACL: 'public-read',
    };

    try {
      const data = await this.s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading the file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadFileFromBuffer(fileName: string, fileBuffer: Buffer): Promise<string> {
    if (!fileName || !fileBuffer) {
      console.error('Error: File name or buffer is missing.');
      throw new Error('File name or buffer is missing.');
    }

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: this.getContentType(fileName),
      ACL: 'public-read',
    };

    try {
      const data = await this.s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error('Error uploading the file buffer:', error);
      throw new Error(`Failed to upload file buffer: ${error.message}`);
    }
  }

  // Utility: Get content type based on file extension
  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case '.xls':
        return 'application/vnd.ms-excel';
      case '.txt':
        return 'text/plain';
      case '.json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}
