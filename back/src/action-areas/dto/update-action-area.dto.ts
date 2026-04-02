import { PartialType } from '@nestjs/mapped-types';
import { CreateActionAreaDto } from './create-action-area.dto';

export class UpdateActionAreaDto extends PartialType(CreateActionAreaDto) {}