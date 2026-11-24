import {
  Body,
  Controller,
  Headers,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { timingSafeEqual } from "node:crypto";
import { OrdersService } from "./orders.service";
import { CreateRfqOrderDto } from "./dto/create-order.dto";

@ApiTags("Manufacturing enquiries")
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("rfq")
  @ApiOperation({
    summary: "Record a custom-manufacturing enquiry (not a purchase order)",
  })
  @ApiHeader({
    name: "x-rfq-api-key",
    required: false,
    description:
      "Server-to-server key. Required when RFQ_API_KEY is configured; mandatory in production.",
  })
  createRfq(
    @Body() dto: CreateRfqOrderDto,
    @Headers("x-rfq-api-key") key?: string,
  ) {
    const expected = process.env.RFQ_API_KEY;
    if (!expected && process.env.NODE_ENV === "production")
      throw new ServiceUnavailableException("RFQ storage is not configured.");
    if (expected) {
      const actualBuffer = Buffer.from(key || ""),
        expectedBuffer = Buffer.from(expected);
      if (
        actualBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(actualBuffer, expectedBuffer)
      )
        throw new UnauthorizedException("Invalid RFQ storage key.");
    }
    return this.ordersService.createCustomRfq(dto);
  }
}
