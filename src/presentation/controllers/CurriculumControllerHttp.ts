import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, OmitType } from '@nestjs/swagger';
import { ParamIdDtoValidatorCqrsService } from 'param-id-validator';
import { GetAllCurriculumQuery } from 'src/core/application/CQRS/curriculum/queries/GetAllQuerycurriculum';
import { GetByIdcurriculumQuery } from 'src/core/application/CQRS/curriculum/queries/GetByIdcurriculum';
import { GetAllPaginatedcurriculumDTO } from 'src/core/application/DTO/http/Curriculum/GetAllPaginatedDTOCurriculum';
import { GetByIdDTOcurriculum } from 'src/core/application/DTO/http/Curriculum/GetByIdDTOCurriculum';
import { CreateActionDTOcurriculum } from 'src/core/application/DTO/http/curriculum/CreateActionDTOcurriculum';
import { DeleteActionDTOcurriculum } from 'src/core/application/DTO/http/curriculum/DeleteActionDTOcurriculum';
import { UpdateActionDTOcurriculum } from 'src/core/application/DTO/http/curriculum/UpdateActionDTOcurriculum';
import { Curriculum } from 'src/infrastructure/persistence/paperlesscv/configuration/curriculum';

export class curriculumControllerHttpOmitId extends OmitType(
  UpdateActionDTOcurriculum,
  ['Id'] as const,
) {}

@ApiTags('curriculum')
@Controller('curriculum')
export class curriculumControllerHttp {
  public constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly paramIdDtoValidatorCqrs: ParamIdDtoValidatorCqrsService,
    private readonly getByIdcurriculumQuery: GetByIdcurriculumQuery,
    private readonly getAllCurriculumQuery: GetAllCurriculumQuery,
  ) {}

  @Get()
  public async Get(
    @Query() body: GetAllPaginatedcurriculumDTO,
  ): Promise<Curriculum[]> {
    return await this.getAllCurriculumQuery.execute(body);
  }

  @Get(':id')
  public async GetById(@Param('id') id: string): Promise<Curriculum> {
    const dtoInstance = new GetByIdDTOcurriculum();
    dtoInstance.id = id;
    return await this.getByIdcurriculumQuery.execute(dtoInstance);
  }

  @Post()
  public async Post(
    @Body() body: CreateActionDTOcurriculum,
  ): Promise<Curriculum> {
    return await this.commandBus.execute(body);
  }

  @Patch()
  public async Patch(
    @Body() body: UpdateActionDTOcurriculum,
  ): Promise<Curriculum> {
    return await this.commandBus.execute(body);
  }

  @Delete(':id')
  public async Delete(@Param('id') id: string): Promise<Curriculum> {
    return await this.commandBus.execute(
      await this.paramIdDtoValidatorCqrs.validateIdDTO(
        DeleteActionDTOcurriculum,
        id,
      ),
    );
  }
}
