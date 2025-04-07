import { ConfigService } from '@nestjs/config';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Curriculum } from '../../../../../infrastructure/persistence/paperlesscv/configuration/curriculum';
import { GetByIdDTOcurriculum } from 'src/core/application/DTO/http/curriculum/GetByIdDTOcurriculum';
import { ElasticsearchService } from '@nestjs/elasticsearch';

// @QueryHandler(GetByIdDTOcurriculum)
export class GetByIdcurriculumQuery
  implements IQueryHandler<GetByIdDTOcurriculum>
{
  constructor(
    @InjectModel(
      Curriculum,
      new ConfigService().get<string>('database_database_name'),
    )
    private readonly curriculum: typeof Curriculum,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  public async execute(query: GetByIdDTOcurriculum): Promise<Curriculum> {
    const result = await this.elasticsearchService.get<Curriculum>({
      index: 'curriculum',
      id: query.id,
    });
    return result._source;
  }
}
