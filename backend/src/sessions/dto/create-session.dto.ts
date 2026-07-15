import { IsString, IsOptional, IsNumber, Min, Max, IsDateString } from 'class-validator';

export enum SessionStatus {
  WAITING = 'WAITING',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
}

export class CreateSessionDto {
  @IsString()
  quizId: string;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(50)
  maxParticipants?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  questionTimeLimit?: number;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}

export class JoinSessionDto {
  @IsString()
  roomCode: string;
}
