import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Metal-to-Viton Bonded Seals' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'metal-to-viton-bonded-seals' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'SSQ-RB-MVB01' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: '674100000000000000000101' })
  @IsMongoId()
  category: string;

  @ApiProperty({ enum: ['rubber', 'steel', 'aluminium'] })
  @IsEnum(['rubber', 'steel', 'aluminium'])
  division: 'rubber' | 'steel' | 'aluminium';

  @ApiPropertyOptional({ example: 'Bonded Seals' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiProperty({ example: 'SS 316 + Viton (FKM) 75 Shore A' })
  @IsString()
  @IsNotEmpty()
  materialGrade: string;

  @ApiPropertyOptional({ example: '-20°C to +250°C · High-Pressure Hydraulic' })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({
    example:
      'Precision stainless retaining ring vulcanized to a Viton elastomer lip.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 2.4, minimum: 0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 100, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQty?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  customizable?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ example: '/images/division-rubber.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}
