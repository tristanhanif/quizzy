import { IsString, IsNotEmpty } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsNotEmpty()
  displayId: string;
}

export class SendMutualDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}

export class AcceptMutualDto {
  @IsString()
  @IsNotEmpty()
  mutualId: string;
}
