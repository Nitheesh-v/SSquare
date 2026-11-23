import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderLineItem,
} from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto, CreateRfqOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {}

  private generateOrderNumber(prefix: 'SSQ-ORD' | 'SSQ-RFQ'): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  }

  async createFromUserCheckout(userId: string, dto: CreateOrderDto) {
    const lineItems: OrderLineItem[] = [];

    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        if (item.productId) {
          const prod: any = await this.productsService.findRawById(
            item.productId,
          );
          lineItems.push({
            product: String(prod._id),
            name: prod.name,
            sku: prod.sku,
            quantity: item.quantity,
            unitPrice: Number(prod.unitPrice),
            customSpecs: item.customSpecs,
          });
        } else {
          lineItems.push({
            name: item.name,
            quantity: item.quantity,
            unitPrice: 0,
            customSpecs: item.customSpecs,
          });
        }
      }
    } else {
      const cart: any = await this.cartService.getOrCreateCart(userId);
      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException(
          'Your cart is empty. Add products before placing an order.',
        );
      }
      for (const cItem of cart.items) {
        const prodId =
          typeof cItem.product === 'object' && cItem.product?._id
            ? String(cItem.product._id)
            : String(cItem.product);
        lineItems.push({
          product: prodId,
          name: cItem.name,
          sku: cItem.sku,
          quantity: Number(cItem.quantity),
          unitPrice: Number(cItem.unitPrice),
          customSpecs: cItem.customSpecs,
        });
      }
      await this.cartService.clearCart(userId);
    }

    const subtotal =
      Math.round(
        lineItems.reduce(
          (sum, i) => sum + Number(i.unitPrice) * Number(i.quantity),
          0,
        ) * 100,
      ) / 100;

    return this.orderModel.create({
      orderNumber: this.generateOrderNumber('SSQ-ORD'),
      user: userId,
      orderType: 'standard_order',
      items: lineItems,
      shippingAddress: dto.shippingAddress,
      subtotal,
      shippingFee: 0,
      shippingMethod: 'DHL / FedEx Free Global Door Delivery (3–4 Days)',
      totalAmount: subtotal,
      currency: 'USD',
      status: 'pending',
      drawingAvailable: dto.drawingAvailable,
      notes: dto.notes,
    });
  }

  async createCustomRfq(dto: CreateRfqOrderDto) {
    const parsedQty = parseInt(String(dto.quantity || '1'), 10);
    const qty = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1;
    const orderNumber = this.generateOrderNumber('SSQ-RFQ');

    const created: any = await this.orderModel.create({
      orderNumber,
      orderType: 'custom_rfq',
      items: [
        {
          name: dto.partName || dto.division || 'Custom Engineered Component',
          quantity: qty,
          unitPrice: 0,
          customSpecs: `${dto.division || 'Multi-Material'} · Qty: ${
            dto.quantity || 'Custom'
          }`,
        },
      ],
      shippingAddress: {
        contactName: dto.name,
        company: dto.company,
        email: dto.email,
        phone: dto.phone,
        country: dto.country || 'India',
      },
      subtotal: 0,
      shippingFee: 0,
      shippingMethod: 'DHL / FedEx Free Global Door Delivery (3–4 Days)',
      totalAmount: 0,
      currency: 'USD',
      status: 'pending',
      drawingAvailable: dto.drawingAvailable,
      notes: dto.message,
    });

    return {
      referenceId: orderNumber,
      order: created,
    };
  }

  async findAllForUser(user: AuthenticatedUser) {
    if (user.role === 'admin') {
      return this.orderModel
        .find()
        .populate('user')
        .sort({ createdAt: -1 })
        .exec();
    }
    return this.orderModel
      .find({ user: user.userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneForUser(id: string, user: AuthenticatedUser) {
    const order: any = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }
    if (
      user.role !== 'admin' &&
      order.user &&
      String(order.user) !== String(user.userId)
    ) {
      throw new ForbiddenException('You do not have access to this order.');
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const updated = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: dto.status,
            ...(dto.trackingNumber
              ? { trackingNumber: dto.trackingNumber }
              : {}),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }
    return updated;
  }
}
