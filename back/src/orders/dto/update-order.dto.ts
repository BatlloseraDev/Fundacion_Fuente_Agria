import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  imageAfter?: string;

  @IsDateString()
  @IsOptional()
  timeInitial?: string;

  @IsDateString()
  @IsOptional()
  timeFinal?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
