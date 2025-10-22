import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

@Injectable()
export class SlugService {
  generate(text: string): string {
    return slugify(text, {
      lower: true,           // tudo em minúsculas
      strict: true,          // remove caracteres especiais
      locale: 'pt',          // suporte a português
      trim: true             // remove espaços extras
    });
  }
}
