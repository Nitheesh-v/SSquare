import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Rajesh Kumar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'rajesh@apexhydraulics.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+91 98765 43210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Apex Hydraulics Pvt Ltd' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ enum: ['customer', 'admin'], default: 'customer' })
  @IsOptional()
  @IsEnum(['customer', 'admin'])
  role?: 'customer' | 'admin';
}
