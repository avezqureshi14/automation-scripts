import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VatFiling, VatFilingSchema } from './entity/vat-filing.schema';
import { VatService } from './vat.service';
import { VatController } from './vat.controller';
import { InvoiceModule } from './invoices/invoice.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: VatFiling.name,
        schema: VatFilingSchema,
        collection: 'vat-filings',
      },
    ]),
    forwardRef(() => InvoiceModule)
  ],
  providers: [VatService],
  exports: [VatService],
  controllers: [VatController]
})
export class VatModule { }
