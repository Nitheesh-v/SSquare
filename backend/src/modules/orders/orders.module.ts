import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CartModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
