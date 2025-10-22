
export class TagMapper {
    static toGraphQL(tag: any): TagWithPosts {
      return {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        posts: tag.posts.map((postRelation: any) => ({
          post: {
            id: postRelation.post.id,
            title: postRelation.post.title,
            slug: postRelation.post.slug,
            createdAt: postRelation.post.createdAt,
          },
        })),
      };
    }
  }