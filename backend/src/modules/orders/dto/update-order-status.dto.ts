import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: [
      'pending',
      'confirmed',
      'in_production',
      'shipped',
      'delivered',
      'cancelled',
    ],
  })
  @IsEnum([
    'pending',
    'confirmed',
    'in_production',
    'shipped',
    'delivered',
    'cancelled',
  ])
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'DHL-8849201942' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;
}
