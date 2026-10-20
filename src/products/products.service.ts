import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product, ProductDocument } from './schemas/product.schema.js';


@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) { }

  //Obtener todos los productos
async getProducts(guestId: string) {
  return this.productModel.find({ guestId });
}

  //Obtener los productos segun su ID especifico


async getProductById(id: string, guestId: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('El ID del producto no es válido');
  }

  const product = await this.productModel.findOne({
    _id: id,
    guestId,
  });

  if (!product) {
    throw new NotFoundException('Producto no encontrado');
  }

  return product;
}
  // Obtener productos por nombre o palabras clave,
  // limitados a la sesión del visitante actual.
  async searchProductsByName(nombre: string, guestId: string) {
    return this.productModel.find({
      guestId,
      nombre: {
        $regex: nombre,
        $options: 'i',
      },
    });
  }

  //Crear productos en el sistema

async createProduct(
  createProductDto: CreateProductDto,
  guestId: string,
) {
  const product = await this.productModel.create({
    ...createProductDto,
    guestId,
  });

  return {
    message: 'Producto creado correctamente',
    product,
  };
}

  //Actualizar los datos de un producto

async updateProduct(
  id: string,
  updateProductDto: UpdateProductDto,
  guestId: string,
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('El ID del producto no es válido');
  }

  const product = await this.productModel.findOneAndUpdate(
    {
      _id: id,
      guestId,
    },
    updateProductDto,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!product) {
    throw new NotFoundException('Producto no encontrado');
  }

  return product;
}

//Eliminar productos existentes

async deleteProduct(id: string, guestId: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('El ID del producto no es válido');
  }

  const product = await this.productModel.findOneAndDelete({
    _id: id,
    guestId,
  });

  if (!product) {
    throw new NotFoundException('Producto no encontrado');
  }

  return {
    message: 'Producto eliminado correctamente',
    product,
  };
}
}