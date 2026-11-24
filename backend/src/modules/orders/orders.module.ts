import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { Order, OrderSchema } from "./schemas/order.schema";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
