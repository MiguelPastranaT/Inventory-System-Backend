import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GuestSessionDocument = HydratedDocument<GuestSession>;

@Schema({ timestamps: true })
export class GuestSession {
  @Prop({ required: true, unique: true })
  guestId: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const GuestSessionSchema =
  SchemaFactory.createForClass(GuestSession);