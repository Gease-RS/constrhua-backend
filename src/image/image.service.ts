import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Image } from '@prisma/client';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async saveImageData(file: Express.Multer.File, postId: number): Promise<Image> {
    return this.prisma.image.create({
      data: {
        url: `/uploads/${file.filename}`,
        alt: file.originalname,
        type: file.mimetype.includes('video') ? 'video' : 'image',
        postId,
      },
    });
  }
}
