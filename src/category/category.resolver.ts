import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { Category } from './entities/category.entity';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Mutation(() => Category)
  async createCategory(@Args('data') data: CreateCategoryInput) {
    return this.categoryService.create(data);
  }

  @Query(() => [Category], { name: 'getCategories' })
  async findAll() {
    return this.categoryService.findAll();
  }

  @Query(() => Category, { name: 'category' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.categoryService.findOne(id);
  }

  @Mutation(() => Category)
  async updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateCategoryInput,
  ) {
    return this.categoryService.update(id, data);
  }

  @Mutation(() => Category)
  async removeCategory(@Args('id', { type: () => Int }) id: number) {
    return this.categoryService.remove(id);
  }

}
