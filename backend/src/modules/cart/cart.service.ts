import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument, CartItem } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
  ) {}

  private calculateSubtotal(items: CartItem[]): number {
    const sum = items.reduce(
      (acc, item) => acc + Number(item.unitPrice) * Number(item.quantity),
      0,
    );
    return Math.round(sum * 100) / 100;
  }

  async getOrCreateCart(userId: string) {
    const existing = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product')
      .exec();

    if (existing) {
      return existing;
    }

    return this.cartModel.create({
      user: userId,
      items: [],
      subtotal: 0,
      currency: 'USD',
    });
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product: any = await this.productsService.findRawById(dto.productId);
    const currentCart: any = await this.cartModel
      .findOne({ user: userId })
      .exec();

    const items: CartItem[] = currentCart?.items ? [...currentCart.items] : [];
    const existingIdx = items.findIndex(
      (i) => String(i.product) === String(dto.productId),
    );

    if (existingIdx >= 0) {
      items[existingIdx] = {
        ...items[existingIdx],
        quantity: Number(items[existingIdx].quantity) + Number(dto.quantity),
        customSpecs: dto.customSpecs ?? items[existingIdx].customSpecs,
      };
    } else {
      items.push({
        product: String(product._id),
        name: product.name,
        sku: product.sku,
        quantity: dto.quantity,
        unitPrice: Number(product.unitPrice),
        customSpecs: dto.customSpecs,
      });
    }

    const subtotal = this.calculateSubtotal(items);

    return this.cartModel
      .findOneAndUpdate(
        { user: userId },
        {
          $set: {
            items,
            subtotal,
            currency: product.currency || 'USD',
          },
        },
        { new: true, upsert: true },
      )
      .populate('items.product')
      .exec();
  }

  async updateItem(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ) {
    const currentCart: any = await this.cartModel
      .findOne({ user: userId })
      .exec();

    if (!currentCart || !Array.isArray(currentCart.items)) {
      throw new NotFoundException('Cart is empty.');
    }

    const items: CartItem[] = [...currentCart.items];
    const idx = items.findIndex(
      (i) => String(i.product) === String(productId),
    );
    if (idx === -1) {
      throw new NotFoundException(
        `Product "${productId}" is not in your cart.`,
      );
    }

    items[idx] = {
      ...items[idx],
      quantity: dto.quantity,
      customSpecs: dto.customSpecs ?? items[idx].customSpecs,
    };

    const subtotal = this.calculateSubtotal(items);
    return this.cartModel
      .findOneAndUpdate(
        { user: userId },
        { $set: { items, subtotal } },
        { new: true },
      )
      .populate('items.product')
      .exec();
  }

  async removeItem(userId: string, productId: string) {
    const currentCart: any = await this.cartModel
      .findOne({ user: userId })
      .exec();
    if (!currentCart || !Array.isArray(currentCart.items)) {
      throw new NotFoundException('Cart is empty.');
    }

    const items = currentCart.items.filter(
      (i: CartItem) => String(i.product) !== String(productId),
    );
    const subtotal = this.calculateSubtotal(items);

    return this.cartModel
      .findOneAndUpdate(
        { user: userId },
        { $set: { items, subtotal } },
        { new: true },
      )
      .populate('items.product')
      .exec();
  }

  async clearCart(userId: string) {
    return this.cartModel
      .findOneAndUpdate(
        { user: userId },
        { $set: { items: [], subtotal: 0 } },
        { new: true, upsert: true },
      )
      .exec();
  }
}
