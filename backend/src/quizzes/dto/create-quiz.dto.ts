import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
}

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsNumber()
  @Min(1)
  points: number;

  @IsArray()
  @IsString({ each: true })
  choices: string[];

  @IsString()
  correctAnswer: string;

  @IsNumber()
  @Min(5)
  timeLimit: number;
}

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  isPublic: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @ArrayMinSize(1)
  questions: CreateQuestionDto[];
}

export class UpdateQuizDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsBoolean()
  isPublic?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}
