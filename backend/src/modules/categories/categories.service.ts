import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = createCategoryDto.slug.toLowerCase().trim();
    const existing = await this.categoryModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException(`Category slug "${slug}" already exists.`);
    }
    return this.categoryModel.create({
      ...createCategoryDto,
      slug,
      isActive: createCategoryDto.isActive ?? true,
    });
  }

  async findAll() {
    return this.categoryModel.find({ isActive: true }).sort({ code: 1 }).exec();
  }

  async findByIdOrSlug(idOrSlug: string) {
    const bySlug = await this.categoryModel
      .findOne({ slug: idOrSlug.toLowerCase() })
      .exec();
    if (bySlug) return bySlug;

    const byId = await this.categoryModel.findById(idOrSlug).exec();
    if (!byId) {
      throw new NotFoundException(`Category "${idOrSlug}" not found.`);
    }
    return byId;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (updateCategoryDto.slug) {
      updateCategoryDto.slug = updateCategoryDto.slug.toLowerCase().trim();
    }
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, { $set: updateCategoryDto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return updated;
  }

  async remove(id: string) {
    const removed = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return { deleted: true, id };
  }
}
