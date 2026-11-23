import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryProductDto {
  @ApiPropertyOptional({ enum: ['rubber', 'steel', 'aluminium'] })
  @IsOptional()
  @IsEnum(['rubber', 'steel', 'aluminium'])
  division?: 'rubber' | 'steel' | 'aluminium';

  @ApiPropertyOptional({ description: 'Category ObjectId' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Search by name, SKU, or material' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 24;
}
