// src/reply-like/reply-like.resolver.ts
import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { ReplyLikeService } from './reply-like.service';
import { ReplyLike } from './entities/reply-like.entity';
import { CreateReplyLikeInput } from './dto/create-reply-like.input';

@Resolver(() => ReplyLike)
export class ReplyLikeResolver {
  constructor(private readonly replyLikeService: ReplyLikeService) {}

  @Mutation(() => ReplyLike)
  likeReply(@Args('data') data: CreateReplyLikeInput) {
    return this.replyLikeService.likeReply(data);
  }

  @Mutation(() => Boolean)
  async unlikeReply(
    @Args('replyId', { type: () => Int }) replyId: number,
    @Args('userId', { type: () => Int }) userId: number,
  ) {
    await this.replyLikeService.unlikeReply(replyId, userId);
    return true;
  }
}
