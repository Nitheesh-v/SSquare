import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { randomUUID } from "node:crypto";
import { Order, OrderDocument } from "./schemas/order.schema";
import { CreateRfqOrderDto } from "./dto/create-order.dto";

/** Enquiry storage only. No checkout, payment, customer or admin endpoints. */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async createCustomRfq(dto: CreateRfqOrderDto) {
    const referenceId = `SSQ-RFQ-${randomUUID().slice(0, 8).toUpperCase()}`;
    const parsed = parseInt(dto.quantity || "1", 10);
    // Retain the existing Order collection format for backwards compatibility.
    // Zero-valued accounting fields are internal, not a customer price or order.
    await this.orderModel.create({
      orderNumber: referenceId,
      orderType: "custom_rfq",
      items: [
        {
          name: dto.partName || dto.division || "Custom component enquiry",
          quantity: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
          unitPrice: 0,
          customSpecs: `${dto.division || "To discuss"} · Quantity: ${dto.quantity || "To discuss"}`,
        },
      ],
      shippingAddress: {
        contactName: dto.name,
        company: dto.company,
        email: dto.email,
        phone: dto.phone,
        country: dto.country || "Not specified",
      },
      subtotal: 0,
      shippingFee: 0,
      totalAmount: 0,
      shippingMethod: "To be confirmed during quotation",
      status: "pending",
      drawingAvailable: dto.drawingAvailable,
      notes: dto.message,
    });
    // Do not return other stored records or unnecessary personal data.
    return { referenceId, submittedAt: new Date().toISOString() };
  }
}
