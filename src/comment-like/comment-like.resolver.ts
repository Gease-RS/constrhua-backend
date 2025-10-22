import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommentLikeService } from './comment-like.service';
import { CommentLike } from './entities/comment-like.entity';
import { CreateCommentLikeInput } from './dto/create-comment-like.input';
import { DeleteCommentLikeInput } from './dto/delete-comment-like.input';

@Resolver(() => CommentLike)
export class CommentLikeResolver {
  constructor(private readonly service: CommentLikeService) {}

  @Mutation(() => CommentLike)
  async likeComment(@Args('data') data: CreateCommentLikeInput) {
    return this.service.like(data);
  }

  @Mutation(() => CommentLike)
  async unlikeComment(@Args('data') data: DeleteCommentLikeInput) {
    return this.service.unlike(data);
  }
}
