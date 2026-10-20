import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GuestSessionsService } from '../guest-sessions.service.js';

@Injectable()
export class GuestSessionGuard implements CanActivate {
  constructor(
    private readonly guestSessionsService: GuestSessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const guestId = request.cookies?.guest_session;

    if (!guestId) {
      throw new UnauthorizedException('No existe una sesión de invitado');
    }

    const session = await this.guestSessionsService.validateSession(guestId);

    if (!session) {
      throw new UnauthorizedException('La sesión no existe o ha expirado');
    }

    // Renovar la cookie en el cliente por otros 10 minutos de inactividad permitida
    response.cookie('guest_session', session.guestId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    request.guestId = session.guestId;

    return true;
  }
}