/*
interface TagWithPosts extends Prisma.TagGetPayload<{
  include: {
    posts: {
      include: {
        post: {
          include: {
            categories: true;
            images: true;
            tags: {
              include: {
                tag: true;
              };
            };
          };
        };
      };
    };
  };
}> { }
*/

interface PostPreview {
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
  }
  
  interface TagWithPosts {
    id: string;
    name: string;
    slug: string;
    posts: { post: PostPreview }[];
  }