import { Resolver, Query, Mutation, Args, ResolveField, Parent, Int } from '@nestjs/graphql';
import { PostService } from './post.service';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { Category } from 'src/category/entities/category.entity';
import { Image } from 'src/image/entities/image.entity'; // ou o caminho correto onde está o entity de Image
import { PostUpdateService } from './post.update';
import { DeletePostDto } from './dto/delete-post.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UsersService,
    private postUpdateService: PostUpdateService,
  ) { }

  @Mutation(() => Post)
  async createPost(@Args('data') data: CreatePostInput) {
    return this.postService.create(data);
  }

  @ResolveField(() => User, { name: 'author' })
  async getAuthor(@Parent() post: Post) {
    return this.userService.findById(post.authorId);
  }

  @Query(() => [Post])
  getPosts() {
    return this.postService.findAll();
  }

  @Query(() => Post, { name: "data", nullable: true })
  async findOnePost(@Args('id', { type: () => Int }) id: number) {
    try {
      return await this.postService.findOne(id);
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      throw new Error(`Erro ao carregar post: ${error.message}`);
    }
  }

  @Mutation(() => Post, { name: 'updatePost' })
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdatePostInput,
  ) {
    try {
      if (isNaN(id)) {
        throw new Error('ID inválido');
      }
      return await this.postUpdateService.postUpdate(id, data);
    } catch (error) {
      console.error('Erro no resolver:', error);
      throw new Error(`Erro ao atualizar post: ${error.message}`);
    }
  }

  @Mutation(() => DeletePostDto)
  removePost(@Args('id', { type: () => Int }) id: number) { 
    return this.postService.remove(id);
  }

  @ResolveField(() => [Category])
  getCategories(@Parent() post: Post) {
    return post.categories;
  }

  @ResolveField(() => [Image])
  getImages(@Parent() post: Post) {
    return post.images;
  }

  @Query(() => Post, { nullable: true })
  findPostBySlug(@Args('slug') slug: string) {
    return this.postService.findBySlug(slug);
  }

}
