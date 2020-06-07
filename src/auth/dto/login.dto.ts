import { IsEmail, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  readonly email: string;

  @Length(3, 128)
  readonly password: string;
}
