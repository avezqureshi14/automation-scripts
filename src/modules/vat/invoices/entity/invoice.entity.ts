import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class CombinedEntity extends Document {
  @Prop({ required: false })
  businessName: string;

  @Prop({ required: false })
  trn: string;

  @Prop({ required: false })
  orgid: string;

  @Prop({ required: false })
  user: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  erpCredentials?: Record<string, any>;

  @Prop({ type: Date, default: () => new Date() })
  createdOn: Date;

  // Invoice fields
  @Prop({ required: false })
  businessId: string;

  @Prop({ required: false })
  invoiceId: string;

  @Prop({ required: false })
  fileType: string;

  @Prop({ required: false })
  source: string;

  @Prop({ required: false })
  linodeObjectKey_v1: string;

  @Prop({ required: false })
  linodeObjectKey: string;

  @Prop({ required: false })
  documentType: string;

  @Prop({ required: true })
  isOrganization: boolean;

  @Prop({ required: true, default: 'New' })
  status: string;

  @Prop({ type: Date, default: () => new Date() })
  created_at: Date;

  @Prop({ type: Boolean, default: () => false })
  isUpdated: Boolean;
}

export const CombinedEntitySchema = SchemaFactory.createForClass(CombinedEntity);
