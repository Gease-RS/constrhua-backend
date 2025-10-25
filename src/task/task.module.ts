import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';
import { StageModule } from 'src/stage/stage.module';

@Module({
  imports: [
    forwardRef(() => StageModule),
  ],
  providers: [TaskResolver, TaskService],
})
export class TaskModule {}
