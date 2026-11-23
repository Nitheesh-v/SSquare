import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Product } from '../../products/schemas/product.schema';

@Schema({ _id: false })
export class OrderLineItem {
  @Prop({ type: Types.ObjectId, ref: Product.name })
  product?: Types.ObjectId | string;

  @Prop({ required: true })
  name: string;

  @Prop()
  sku?: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  unitPrice: number;

  @Prop({ trim: true })
  customSpecs?: string;
}

export const OrderLineItemSchema = SchemaFactory.createForClass(OrderLineItem);

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ required: true, trim: true })
  contactName: string;

  @Prop({ trim: true })
  company?: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true })
  addressLine?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ required: true, trim: true })
  country: string;
}

export const ShippingAddressSchema =
  SchemaFactory.createForClass(ShippingAddress);

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user?: Types.ObjectId | string;

  @Prop({ enum: ['standard_order', 'custom_rfq'], default: 'standard_order' })
  orderType: 'standard_order' | 'custom_rfq';

  @Prop({ type: [OrderLineItemSchema], default: [] })
  items: OrderLineItem[];

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ default: 0, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  shippingFee: number;

  @Prop({ default: 'DHL / FedEx Free Global Door Delivery (3–4 Days)' })
  shippingMethod: string;

  @Prop({ default: 0, min: 0 })
  totalAmount: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({
    enum: [
      'pending',
      'confirmed',
      'in_production',
      'shipped',
      'delivered',
      'cancelled',
    ],
    default: 'pending',
  })
  status: OrderStatus;

  @Prop({ trim: true })
  drawingAvailable?: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ trim: true })
  trackingNumber?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
