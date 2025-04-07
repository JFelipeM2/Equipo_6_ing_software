import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectModel } from '@nestjs/sequelize';
import { Curriculum } from '../../../../../infrastructure/persistence/paperlesscv/configuration/curriculum';
import { CreateActionDTOcurriculum } from '../../../DTO/http/curriculum/CreateActionDTOcurriculum';

@CommandHandler(CreateActionDTOcurriculum)
export class CreateCommandcurriculum
  implements ICommandHandler<CreateActionDTOcurriculum>
{
  constructor(
    @InjectModel(
      Curriculum,
      new ConfigService().get<string>('database_database_name'),
    )
    private readonly curriculum: typeof Curriculum,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  public async execute(
    command: CreateActionDTOcurriculum,
  ): Promise<Curriculum> {
    const created = await this.curriculum.create(command);
    await this.elasticsearch.index({
      index: 'curriculum',
      id: created.Id,
      body: { ...created.toJSON() },
    });
    return created;
  }
}
