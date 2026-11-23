import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: '674100000000000000000201' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ example: 100, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    example: 'M16 ID · Viton 75 Shore A · Per attached drawing REV-B',
  })
  @IsOptional()
  @IsString()
  customSpecs?: string;
}
