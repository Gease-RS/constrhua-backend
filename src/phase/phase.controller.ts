import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PhaseService } from './phase.service';

@Controller('new-phase')
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @Get()
  async createNewPhase(@Query('constructionId') constructionId: string) {
    if (!constructionId) {
      throw new BadRequestException('constructionId é obrigatório');
    }

    const id = parseInt(constructionId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('constructionId inválido');
    }

    return this.phaseService.createNewPhaseFromTemplate(id);
  }
}
