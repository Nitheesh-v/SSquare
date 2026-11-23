import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ProductsModule } from '../products/products.module';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ProductsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
