import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const slug = createProductDto.slug.toLowerCase().trim();
    const sku = createProductDto.sku.toUpperCase().trim();

    const existing = await this.productModel
      .findOne({ $or: [{ slug }, { sku }] })
      .exec();
    if (existing) {
      throw new ConflictException(
        `A product with slug "${slug}" or SKU "${sku}" already exists.`,
      );
    }

    return this.productModel.create({
      ...createProductDto,
      slug,
      sku,
    });
  }

  async findAll(query: QueryProductDto) {
    const filter: Record<string, any> = {};

    if (query.division) {
      filter.division = query.division;
    }
    if (query.category) {
      filter.category = query.category;
    }
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { materialGrade: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 24;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findByIdOrSlug(idOrSlug: string) {
    const bySlug = await this.productModel
      .findOne({ slug: idOrSlug.toLowerCase() })
      .populate('category')
      .exec();
    if (bySlug) return bySlug;

    const byId = await this.productModel
      .findById(idOrSlug)
      .populate('category')
      .exec();
    if (!byId) {
      throw new NotFoundException(`Product "${idOrSlug}" not found.`);
    }
    return byId;
  }

  async findRawById(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (updateProductDto.slug) {
      updateProductDto.slug = updateProductDto.slug.toLowerCase().trim();
    }
    if (updateProductDto.sku) {
      updateProductDto.sku = updateProductDto.sku.toUpperCase().trim();
    }
    const updated = await this.productModel
      .findByIdAndUpdate(id, { $set: updateProductDto }, { new: true })
      .populate('category')
      .exec();
    if (!updated) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }
    return updated;
  }

  async remove(id: string) {
    const removed = await this.productModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }
    return { deleted: true, id };
  }
}
