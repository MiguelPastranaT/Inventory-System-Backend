import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'API del sistema de inventario funcionando correctamente duble y duble y dublulidu!!';
  }
}
