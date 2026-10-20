import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { GuestSessionsModule } from '../guest-sessions/guest-sessions.module.js';

@Module({
    imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
     GuestSessionsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}