import { IsString, IsEmail, MinLength, IsEnum, IsNotEmpty } from 'class-validator';

export enum UserRole {
  CREATOR = 'CREATOR',
  PARTICIPANT = 'PARTICIPANT',
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class SetRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
