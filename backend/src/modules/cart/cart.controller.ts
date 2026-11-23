import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve current authenticated user cart' })
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getOrCreateCart(user.userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a component/product to cart' })
  addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItem(user.userId, addCartItemDto);
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update quantity or custom specs of a cart item' })
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseObjectIdPipe) productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      user.userId,
      productId,
      updateCartItemDto,
    );
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a specific product from cart' })
  removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseObjectIdPipe) productId: string,
  ) {
    return this.cartService.removeItem(user.userId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items in cart' })
  clearCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.clearCart(user.userId);
  }
}
