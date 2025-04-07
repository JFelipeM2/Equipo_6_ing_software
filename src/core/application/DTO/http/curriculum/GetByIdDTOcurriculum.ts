import { IsString, IsUUID } from 'class-validator';

export class GetByIdDTOcurriculum {
  @IsString()
  @IsUUID()
  public id: string;
}
