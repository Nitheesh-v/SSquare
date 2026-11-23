import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  sku: string;

  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  category: Types.ObjectId | string;

  @Prop({ enum: ['rubber', 'steel', 'aluminium'], required: true })
  division: 'rubber' | 'steel' | 'aluminium';

  @Prop({ trim: true })
  subCategory?: string;

  @Prop({ required: true, trim: true })
  materialGrade: string;

  @Prop({ trim: true })
  specifications?: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 1, min: 1 })
  minOrderQty: number;

  @Prop({ default: true })
  customizable: boolean;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ trim: true })
  image?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
