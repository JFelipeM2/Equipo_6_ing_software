import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAllPaginatedcurriculumDTO {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  public page: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(250)
  public limit: number;
}
