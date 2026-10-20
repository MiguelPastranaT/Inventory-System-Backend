import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';

import {
  GuestSession,
  GuestSessionDocument,
} from './schemas/guest-session.schema.js';
import {
  Product,
  ProductDocument,
} from '../products/schemas/product.schema.js';

@Injectable()
export class GuestSessionsService implements OnModuleDestroy {
  private readonly logger = new Logger(GuestSessionsService.name);

  // 10 minutos expresados en milisegundos
  private readonly INACTIVITY_TIME_MS = 10 * 60 * 1000;

  // Mapa en memoria: almacena el temporizador activo para cada guestId
  private readonly sessionTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel(GuestSession.name)
    private readonly guestSessionModel: Model<GuestSessionDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  // Buenas prácticas: si el servidor se apaga o reinicia, cancela temporizadores pendientes
  onModuleDestroy() {
    for (const timeout of this.sessionTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.sessionTimeouts.clear();
  }

  /**
   * Crea una nueva sesión e inicia su cuenta regresiva de inactividad
   */
  async createSession() {
    const guestId = randomUUID();
    const expiresAt = new Date(Date.now() + this.INACTIVITY_TIME_MS);

    const session = await this.guestSessionModel.create({
      guestId,
      expiresAt,
    });

    // Iniciamos el temporizador para este usuario
    this.scheduleSessionCleanup(guestId);

    return session;
  }

  /**
   * Valida la sesión y extiende su vida útil si el usuario sigue interactuando
   */
  async validateSession(guestId: string) {
    const session = await this.guestSessionModel.findOne({ guestId });

    if (!session) {
      return null;
    }

    if (session.expiresAt <= new Date()) {
      // Si por alguna razón la fecha ya pasó, ejecutamos limpieza inmediata
      await this.cleanupSessionData(guestId);
      return null;
    }

    // El usuario está activo: extendemos el tiempo de expiración
    const newExpiresAt = new Date(Date.now() + this.INACTIVITY_TIME_MS);
    session.expiresAt = newExpiresAt;
    await session.save();

    // Reiniciamos el temporizador de inactividad
    this.scheduleSessionCleanup(guestId);

    return session;
  }

  /**
   * Cancela el temporizador anterior y programa uno nuevo de 10 minutos
   */
  private scheduleSessionCleanup(guestId: string) {
    // Si ya había un temporizador corriendo para este usuario, lo cancelamos
    const existingTimeout = this.sessionTimeouts.get(guestId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Programamos la ejecución al cabo de 10 minutos exactos de inactividad
    const timeout = setTimeout(async () => {
      this.logger.log(
        `Sesión inactiva durante 10 minutos. Purgando datos del guestId: ${guestId}`,
      );
      await this.cleanupSessionData(guestId);
    }, this.INACTIVITY_TIME_MS);

    // Guardamos la referencia del nuevo temporizador
    this.sessionTimeouts.set(guestId, timeout);
  }

  /**
   * Elimina en paralelo los productos y la sesión del usuario inactivo
   */
  async cleanupSessionData(guestId: string) {
    try {
      // 1. Cancelar y remover el temporizador de memoria
      const existingTimeout = this.sessionTimeouts.get(guestId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.sessionTimeouts.delete(guestId);
      }

      // 2. Ejecutar el borrado conjunto en la base de datos
      const [productsResult] = await Promise.all([
        this.productModel.deleteMany({ guestId }),
        this.guestSessionModel.deleteOne({ guestId }),
      ]);

      this.logger.log(
        `Limpieza completada para [${guestId}]: se eliminaron ${productsResult.deletedCount} productos y la sesión.`,
      );
    } catch (error) {
      this.logger.error(
        `Error al purgar los datos de la sesión ${guestId}`,
        error,
      );
    }
  }
}