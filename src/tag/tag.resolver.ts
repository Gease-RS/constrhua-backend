import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent, ObjectType, Field } from '@nestjs/graphql';
import { TagService } from './tag.service';
import { Tag } from './entities/tag.entity';
import { Post } from 'src/post/entities/post.entity';
import { TagWithPosts } from './dto/tag-with-posts.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => Tag)
export class TagResolver {
  constructor(
    private readonly tagService: TagService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [Tag], { name: 'tags' })
  findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.tagService.findAll({ skip, take, search });
  }

  @Query(() => Tag, { name: 'tag' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tagService.findOne(id);
  }

  @Query(() => TagWithPosts)
  async tagBySlug(@Args('slug') slug: string) {
    return this.tagService.getTagWithPosts(slug);
  }

  @ResolveField('posts', () => [Post], { nullable: true })
  async getPosts(@Parent() tag: Tag) {
    return this.tagService.getPostsByTag(tag.id);
  }

  @Query(() => Tag, { name: 'tagBySlug' })
  findBySlug(@Args('slug', { type: () => String }) slug: string) {
    return this.tagService.findBySlug(slug);
  }

  @Mutation(() => Tag)
  removeTag(@Args('id', { type: () => Int }) id: number) {
    return this.tagService.remove(id);
  }

  // Query para tags populares
  @Query(() => [TagCount], { name: 'popularTags' })
  async getPopularTags(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) 
    limit: number,
  ) {
    return this.tagService.getPopularTags(limit);
  }

  getPostsByTag(tagId: number) {
    throw new Error('Method not implemented.');
  }
}

// Tipo adicional para a query de tags populares
@ObjectType()
class TagCount extends Tag {
  @Field(() => Int)
  postCount: number;
}

/**
 // Para queries que listam várias tags
@Query(() => [Tag])
async tags() {
  const tags = await this.tagService.findAll();
  const posts = await this.tagService.getPostsForMultipleTags(tags.map(t => t.id));
  
  return tags.map(tag => ({
    ...tag,
    posts: posts.filter(p => p.tags.some(t => t.tagId === tag.id))
  }));
}
 */