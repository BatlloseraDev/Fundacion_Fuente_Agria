import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsNumber, IsDate, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsOptional()
    @IsInt()
    quantity?: number;

    @IsOptional()
    @IsString()
    imageBefore?: string;

    @IsOptional()
    @IsString()
    imageAfter?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    timeInitial?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    timeFinal?: Date;

    @IsInt()
    @IsNotEmpty()
    userId: number;


}
