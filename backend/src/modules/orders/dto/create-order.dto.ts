import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from "class-validator";

export class CreateRfqOrderDto {
  @ApiProperty({ example: "Engineering buyer" })
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string;

  @ApiProperty({ example: "buyer@example.com" })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: "+91 75300 80040" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone: string;

  @ApiPropertyOptional({ example: "Aluminium Products" })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  division?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(240)
  partName?: string;

  @ApiPropertyOptional({ example: "500 pieces" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  quantity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  drawingAvailable?: string;

  @ApiProperty({ description: "Application, material and drawing notes" })
  @IsString()
  @Length(10, 6000)
  message: string;
}
