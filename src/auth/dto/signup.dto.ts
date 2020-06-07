import { IsEmail, Length } from 'class-validator';

export class SignupDto {
  @Length(3, 128)
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @Length(3, 128)
  readonly password: string;
}
