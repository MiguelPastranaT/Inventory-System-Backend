import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { GuestSessionsService } from './guest-sessions.service.js';
import { GuestSessionGuard } from './guards/guest-session.guard.js';

const isProduction = process.env.NODE_ENV === 'production';

// Configuración centralizada de cookies para mantener paridad
const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // En producción requiere HTTPS
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  maxAge: 10 * 60 * 1000, // 10 minutos
};

@Controller('guest-sessions')
export class GuestSessionsController {
  constructor(
    private readonly guestSessionsService: GuestSessionsService,
  ) {}

  @Post()
  async createSession(
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.guestSessionsService.createSession();

    response.cookie('guest_session', session.guestId, cookieOptions);

    return {
      message: 'Sesión de invitado creada correctamente',
      expiresAt: session.expiresAt,
    };
  }

  @Get()
  async validateSession(@Req() request: Request) {
    const guestId = request.cookies?.guest_session;

    if (!guestId) {
      return {
        valid: false,
        message: 'No existe una sesión de invitado',
      };
    }

    const session =
      await this.guestSessionsService.validateSession(guestId);

    if (!session) {
      return {
        valid: false,
        message: 'La sesión no existe o ha expirado',
      };
    }

    return {
      valid: true,
      message: 'Sesión válida',
      expiresAt: session.expiresAt,
    };
  }

  @Post('keep-alive')
  @UseGuards(GuestSessionGuard)
  @HttpCode(HttpStatus.OK)
  keepAlive(@Req() request: Request) {
    return {
      message: 'Sesión extendida correctamente',
      guestId: request.guestId,
    };
  }

  @Post('logout')
  @UseGuards(GuestSessionGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const guestId = request.guestId!;

    await this.guestSessionsService.cleanupSessionData(guestId);

    // Limpieza con las mismas banderas con las que fue creada
    response.clearCookie('guest_session', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    return {
      message: 'Sesión cerrada y datos eliminados correctamente',
    };
  }
}