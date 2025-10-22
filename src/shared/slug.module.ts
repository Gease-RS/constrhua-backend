import { Module } from "@nestjs/common";
import { SlugService } from "./slug.service";

// slug.module.ts
@Module({
    providers: [SlugService],
    exports: [SlugService], // <- importante para que outros módulos usem
  })
  export class SlugModule {}
  