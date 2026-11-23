import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
