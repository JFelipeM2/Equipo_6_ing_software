import { ConfigService } from '@nestjs/config';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Curriculum } from '../../../../../infrastructure/persistence/paperlesscv/configuration/curriculum';
import { GetBySearchDTOcurriculum } from 'src/core/application/DTO/http/curriculum/GetBySearchDTOcurriculum';

@QueryHandler(GetBySearchDTOcurriculum)
export class GetBySearchcurriculum
  implements IQueryHandler<GetBySearchDTOcurriculum>
{
  constructor(
    @InjectModel(
      Curriculum,
      new ConfigService().get<string>('database_database_name'),
    )
    private readonly curriculum: typeof Curriculum,
  ) {}

  public async execute(query: GetBySearchDTOcurriculum): Promise<Curriculum[]> {
    const { propertyName, searchExpression } = query;
    return await this.curriculum.findAll({
      where: {
        [propertyName]: {
          [Op.like]: searchExpression,
        },
      },
    });
  }
}
