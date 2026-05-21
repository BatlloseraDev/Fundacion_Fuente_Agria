import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

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

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
