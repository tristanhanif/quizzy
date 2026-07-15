import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResultsService } from './results.service';
import { SubmitResultDto } from './dto/submit-result.dto';

@Controller('results')
@UseGuards(AuthGuard('jwt'))
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitResult(@Body() submitResultDto: SubmitResultDto, @Request() req) {
    return this.resultsService.submitResult(submitResultDto, req.user.userId);
  }

  @Get('leaderboard/:sessionId')
  async getLeaderboard(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.resultsService.getLeaderboard(sessionId, limitNumber);
  }

  @Get('session/:sessionId')
  async getSessionResults(@Param('sessionId') sessionId: string) {
    return this.resultsService.getSessionResults(sessionId);
  }

  @Get('user/:userId')
  async getUserResults(@Param('userId') userId: string) {
    return this.resultsService.getUserResults(userId);
  }

  @Get(':id')
  async getResultById(@Param('id') id: string) {
    return this.resultsService.getResultById(id);
  }
}
