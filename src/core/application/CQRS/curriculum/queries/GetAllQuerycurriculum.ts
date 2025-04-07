import { ConfigService } from '@nestjs/config';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { InjectModel } from '@nestjs/sequelize';
import { Curriculum } from '../../../../../infrastructure/persistence/paperlesscv/configuration/curriculum';
import { GetAllPaginatedcurriculumDTO } from 'src/core/application/DTO/http/curriculum/GetAllPaginatedDTOcurriculum';

// @QueryHandler(GetAllPaginatedcurriculumDTO)
export class GetAllCurriculumQuery
  implements IQueryHandler<GetAllPaginatedcurriculumDTO>
{
  constructor(
    @InjectModel(
      Curriculum,
      new ConfigService().get<string>('database_database_name'),
    )
    private readonly curriculum: typeof Curriculum,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  public async execute(
    command: GetAllPaginatedcurriculumDTO,
  ): Promise<Curriculum[]> {
    const body: SearchResponse<Curriculum> =
      await this.elasticsearchService.search({
        index: 'curriculum',
        body: {
          from: (command.page - 1) * command.limit,
          size: command.limit,
        },
      });
    return body.hits.hits.map((data) => data._source);
  }
}
