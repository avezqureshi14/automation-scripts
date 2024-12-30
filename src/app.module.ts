import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { InvoiceModule } from './modules/vat/invoices/invoice.module';
import { ErpnextModule } from './modules/erpnext/erpnext.module';
import { VatModule } from './modules/vat/vat.module';

@Module({
  imports: [DbModule, InvoiceModule, ErpnextModule, VatModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
