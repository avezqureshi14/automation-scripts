import { forwardRef, Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CombinedEntity, CombinedEntitySchema } from './entity/invoice.entity';
import { ExcelModule } from '../../../common/excel/excel.module';
import { LinodeModule } from '../../../common/linode/linode.module';
import { VatModule } from '../vat.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CombinedEntity.name,
        schema: CombinedEntitySchema,
        collection: 'Org A',
      }
    ]),
    ExcelModule,
    LinodeModule,
    forwardRef(() => VatModule)
  ],
  exports: [InvoiceService],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule { }
