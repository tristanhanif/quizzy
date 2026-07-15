import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, JoinSessionDto } from './dto/create-session.dto';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSessionDto: CreateSessionDto, @Request() req) {
    return this.sessionsService.create(createSessionDto, req.user.userId);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async join(@Body() joinSessionDto: JoinSessionDto, @Request() req) {
    return this.sessionsService.join(joinSessionDto, req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Get('room/:roomCode')
  async findByRoomCode(@Param('roomCode') roomCode: string) {
    return this.sessionsService.findByRoomCode(roomCode);
  }

  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    return this.sessionsService.getParticipants(id);
  }
}
