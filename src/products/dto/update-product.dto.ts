import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede enviarse vacío' })
  nombre?: string;

  @IsOptional()
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser inferior a 0' })
  cantidad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un valor numérico' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  precio?: number;
}