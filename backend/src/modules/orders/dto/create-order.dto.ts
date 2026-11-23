import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemInputDto {
  @ApiPropertyOptional({ example: '674100000000000000000201' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ example: 'Metal-to-Viton Bonded Seals' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 500, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'M16 Viton 75 Shore A' })
  @IsOptional()
  @IsString()
  customSpecs?: string;
}

export class ShippingAddressInputDto {
  @ApiProperty({ example: 'Rajesh Kumar' })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiPropertyOptional({ example: 'Apex Hydraulics Pvt Ltd' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ example: 'rajesh@apexhydraulics.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'Plot 14, Industrial Estate' })
  @IsOptional()
  @IsString()
  addressLine?: string;

  @ApiPropertyOptional({ example: 'Chennai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: ShippingAddressInputDto })
  @ValidateNested()
  @Type(() => ShippingAddressInputDto)
  shippingAddress: ShippingAddressInputDto;

  @ApiPropertyOptional({
    type: [OrderItemInputDto],
    description:
      'Optional explicit line items; if omitted on authenticated checkout, items are pulled from the user cart.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items?: OrderItemInputDto[];

  @ApiPropertyOptional({ example: 'Yes – CAD / PDF Drawing Ready' })
  @IsOptional()
  @IsString()
  drawingAvailable?: string;

  @ApiPropertyOptional({
    example: 'Require batch test certificate & DHL express delivery.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRfqOrderDto {
  @ApiProperty({ example: 'Rajesh Kumar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Apex Hydraulics Pvt Ltd' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ example: 'rajesh@apexhydraulics.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'Rubber Products' })
  @IsOptional()
  @IsString()
  division?: string;

  @ApiPropertyOptional({ example: 'Metal-to-Viton Bonded Seal' })
  @IsOptional()
  @IsString()
  partName?: string;

  @ApiPropertyOptional({ example: '1000 pcs' })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiPropertyOptional({ example: 'Germany' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Yes – CAD / PDF Drawing Ready' })
  @IsOptional()
  @IsString()
  drawingAvailable?: string;

  @ApiProperty({ example: 'Need M16 Viton 75 Shore A bonded washers.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
