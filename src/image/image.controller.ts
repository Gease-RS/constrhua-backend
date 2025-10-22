import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageService } from './image.service';
import { extname } from 'path';

@Controller('images')
export class UploadController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 50 // 50MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi)$/)) {
        return callback(new Error('Apenas imagens e vídeos são permitidos!'), false);
      }
      callback(null, true);
    }
  }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File, // Agora deve funcionar
    @Body('postId') postId: number,
  ) {
    return this.imageService.saveImageData(file, Number(postId));
  }
}

/**
 * Namespace 'global.Express' has no exported member 'Multer'.ts(2694)
 */