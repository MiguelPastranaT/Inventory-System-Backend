import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  GuestSession,
  GuestSessionDocument,
} from './schemas/guest-session.schema.js';
import {
  Product,
  ProductDocument,
} from '../products/schemas/product.schema.js';

@Injectable()
export class GuestMaintenanceService implements OnApplicationBootstrap {
  private readonly logger = new Logger(GuestMaintenanceService.name);

  constructor(
    @InjectModel(GuestSession.name)
    private readonly guestSessionModel: Model<GuestSessionDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  /**
   * Se ejecuta automáticamente 1 sola vez en cuanto el servidor enciende o se reinicia.
   * Esto es ideal para limpiar la basura inmediatamente después de una caída.
   */
  async onApplicationBootstrap() {
    this.logger.log('Servidor iniciado: ejecutando limpieza preventiva de datos huérfanos...');
    await this.handleEmergencyOrphanCleanup();
  }

  // /**
  //  * Tarea de respaldo programada.
  //  * '0 0 */3 * *' = A las 00:00 cada 3 días.
  //  * (Si prefieres semanal puedes usar CronExpression.EVERY_WEEK)
  //  */
  @Cron('0 0 */3 * *')
  async handleEmergencyOrphanCleanup() {
    this.logger.log('Iniciando barrido de seguridad para datos huérfanos...');

    try {
      const now = new Date();

      // 1. Identificar sesiones cuya fecha de expiración ya pasó
      // (Si hay temporizadores rotos, la fecha de expiración habrá quedado en el pasado)
      const expiredSessions = await this.guestSessionModel.find({
        expiresAt: { $lt: now }, //$lt significa "less than" (menor que)
      });

      const expiredGuestIds = expiredSessions.map((s) => s.guestId);

      if (expiredGuestIds.length > 0) {
        // 2. Eliminar en paralelo los productos y las sesiones caducadas
        const [productsDeleted, sessionsDeleted] = await Promise.all([
          this.productModel.deleteMany({ guestId: { $in: expiredGuestIds } }),
          this.guestSessionModel.deleteMany({ guestId: { $in: expiredGuestIds } }),
        ]);

        this.logger.log(
          `Rescate completado: se purgaron ${sessionsDeleted.deletedCount} sesiones caducadas y ${productsDeleted.deletedCount} productos.`,
        );
      }

      // 3. Chequeo extra: borrar productos que no tengan ninguna sesión asociada
      const activeGuestIds = await this.guestSessionModel.distinct('guestId');
      
      const orphanProducts = await this.productModel.deleteMany({
        guestId: { $nin: activeGuestIds }, //$nin significa "not in"
      });

      if (orphanProducts.deletedCount > 0) {
        this.logger.log(
          `Se encontraron y eliminaron ${orphanProducts.deletedCount} productos totalmente huérfanos.`,
        );
      }
      
    } catch (error) {
      this.logger.error('Error durante el barrido de seguridad', error);
    }
  }
}