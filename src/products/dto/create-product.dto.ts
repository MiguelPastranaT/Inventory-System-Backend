import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  nombre: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser inferior a 0' })
  cantidad: number;

  @IsNumber({}, { message: 'El precio debe ser un valor numérico' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  precio: number;
}