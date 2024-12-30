import { Module } from '@nestjs/common';
import { ErpnextService } from './erpnext.service';
import { LinodeModule } from '../../common/linode/linode.module';
import { ExcelModule } from '../../common/excel/excel.module';
import { ErpnextController } from './erpnext.controller';
import { HttpModule } from '@nestjs/axios';
import { InvoiceModule } from '../vat/invoices/invoice.module';
import { VatModule } from '../vat/vat.module';
import { ErpnextApiService } from './erpnext-api.service';
import { ApiModule } from 'src/common/api/api.module';

@Module({
  imports: [
    LinodeModule,
    ExcelModule,
    HttpModule,
    InvoiceModule,
    VatModule,
    ApiModule
  ],
  controllers: [ErpnextController],
  providers: [ErpnextService, ErpnextApiService],
  exports: [ErpnextService]
})
export class ErpnextModule { }
