import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsISO8601,
  IsArray,
  IsInt,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContentBlockDto {
  @IsIn(['text', 'image'])
  type: 'text' | 'image';

  @IsString()
  content: string;
}

export class CreateActividadDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsISO8601()
  date: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  @IsOptional()
  blocks?: ContentBlockDto[];
}
