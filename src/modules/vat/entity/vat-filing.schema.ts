import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VatFilingDocument = VatFiling & Document;

@Schema()
export class VatFiling {
    @Prop({ required: true })
    vatId: string;

    @Prop({ required: true })
    dateRange: string;

    @Prop({ type: [String], default: [] })
    filingInvoices: string[];

    @Prop({ type: [String], default: [] })
    failedInvoices: string[];

    @Prop({ required: true })
    linodeObjectKey: string;

    @Prop({ required: true })
    status: string;
}

export const VatFilingSchema = SchemaFactory.createForClass(VatFiling);
