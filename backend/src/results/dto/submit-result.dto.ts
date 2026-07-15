import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answer: string;

  @IsNumber()
  score: number;
}

export class SubmitResultDto {
  @IsString()
  sessionId: string;

  @IsNumber()
  totalScore: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class LeaderboardEntry {
  participantId: string;
  participantName: string;
  score: number;
  rank: number;
}
