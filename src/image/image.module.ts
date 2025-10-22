import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadController } from './image.controller';
import { ImageService } from './image.service';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController],
  providers: [ImageService],
})
export class ImageModule {}
