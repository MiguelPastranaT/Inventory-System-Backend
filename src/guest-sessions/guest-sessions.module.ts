import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  GuestSession,
  GuestSessionSchema,
} from './schemas/guest-session.schema.js';
import {
  Product,
  ProductSchema,
} from '../products/schemas/product.schema.js';

import { GuestSessionsService } from './guest-sessions.service.js';
import { GuestSessionsController } from './guest-sessions.controller.js';
import { GuestSessionGuard } from './guards/guest-session.guard.js';
import { GuestMaintenanceService } from './guest-maintenance.service.js'; // <-- 1. Importarlo

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GuestSession.name, schema: GuestSessionSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [GuestSessionsController],
  providers: [
    GuestSessionsService,
    GuestSessionGuard,
    GuestMaintenanceService, // <-- 2. Registrarlo aquí
  ],
  exports: [GuestSessionsService, GuestSessionGuard],
})
export class GuestSessionsModule {}