import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, CreateRfqOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post('rfq')
  @ApiOperation({
    summary: 'Submit a public custom manufacturing RFQ / quote order',
  })
  createRfq(@Body() createRfqDto: CreateRfqOrderDto) {
    return this.ordersService.createCustomRfq(createRfqDto);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'Create a new order from cart or explicit items (Authenticated)',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createFromUserCheckout(
      user.userId,
      createOrderDto,
    );
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary:
      'List orders (Customers see own orders; Admins see all orders & RFQs)',
  })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findAllForUser(user);
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.findOneForUser(id, user);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update order status & DHL/FedEx tracking number (Admin only)',
  })
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
