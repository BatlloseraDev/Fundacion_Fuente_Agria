import { IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  articleId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
