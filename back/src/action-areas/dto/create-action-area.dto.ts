import { IsString, IsNotEmpty } from 'class-validator';

export class CreateActionAreaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  themeColor: string;

  @IsString()
  @IsNotEmpty()
  linkText: string;
}