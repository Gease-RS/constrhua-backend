import { Resolver, Mutation, Query, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { LikeCommentInput } from './dto/like-comment.input';
import { CommentType } from './comment.type';

@Resolver(() => CommentType)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) { }

  @Mutation(() => CommentType)
  async createComment(@Args('data') data: CreateCommentInput) {
    return this.commentService.createNewComment(data);
  }

  @Query(() => [CommentType], { name: 'getComments' })
  async findAll() {
    return this.commentService.findAll();
  }

  @Query(() => CommentType, { name: 'comment' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.commentService.findOne(id);
  }

  @Mutation(() => CommentType)
  async updateComment(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateCommentInput,
  ) {
    return this.commentService.update(id, data);
  }

  @Mutation(() => CommentType)
  async removeComment(@Args('id', { type: () => Int }) id: number) {
    return this.commentService.remove(id);
  }

  @Query(() => [CommentType], { name: 'CommentsByPost' })
  CommentsByPost(@Args('postId', { type: () => Int }) postId: number) {
    return this.commentService.findByPost(postId);
  }

}
