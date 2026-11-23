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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@ApiTags('Categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active manufacturing categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get category details by ID or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoriesService.findByIdOrSlug(idOrSlug);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new product category (Admin only)' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update category by ID (Admin only)' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID (Admin only)' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
