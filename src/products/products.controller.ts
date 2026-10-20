import { ProductsService } from './products.service.js'
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import type { Request } from 'express';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { GuestSessionGuard } from '../guest-sessions/guards/guest-session.guard.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  //Obtener todos los productos
@Get()
@UseGuards(GuestSessionGuard)
getProducts(@Req() request: Request) {
  return this.productsService.getProducts(request.guestId!);
}


  // Buscar productos por nombre dentro de la sesión actual.
  @Get('search')
  @UseGuards(GuestSessionGuard)
  searchProductsByName(
    @Query('nombre') nombre: string,
    @Req() request: Request,
  ) {
    return this.productsService.searchProductsByName(
      nombre,
      request.guestId!,
    );
  }
  //Obtener los productos segun su ID especifico

@Get(':id')
@UseGuards(GuestSessionGuard)
getProductById(
  @Param('id') id: string,
  @Req() request: Request,
) {
  return this.productsService.getProductById(
    id,
    request.guestId!,
  );
}

  //Crear productos en el sistema
@Post()
@UseGuards(GuestSessionGuard)
createProduct(
  @Body() createProductDto: CreateProductDto,
  @Req() request: Request,
) {
  return this.productsService.createProduct(
    createProductDto,
    request.guestId!,
  );
}

  //Actualizar los datos de un producto

@Patch(':id')
@UseGuards(GuestSessionGuard)
updateProduct(
  @Param('id') id: string,
  @Body() updateProductDto: UpdateProductDto,
  @Req() request: Request,
) {
  return this.productsService.updateProduct(
    id,
    updateProductDto,
    request.guestId!,
  );
}

  //Eliminar un producto existente

@Delete(':id')
@UseGuards(GuestSessionGuard)
deleteProduct(
  @Param('id') id: string,
  @Req() request: Request,
) {
  return this.productsService.deleteProduct(
    id,
    request.guestId!,
  );
}
}