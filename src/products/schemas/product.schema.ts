import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, min: 0 })
  cantidad: number;

  @Prop({ required: true, min: 0 })
  precio: number;

  // Indexado para que las búsquedas y el deleteMany({ guestId }) vuelen
  @Prop({ required: true, index: true })
  guestId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);