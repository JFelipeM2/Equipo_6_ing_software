import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Curriculum } from '../../../../../infrastructure/persistence/paperlesscv/configuration/curriculum';
import { UpdateActionDTOcurriculum } from '../../../DTO/http/curriculum/UpdateActionDTOcurriculum';

@CommandHandler(UpdateActionDTOcurriculum)
export class UpdateCommandcurriculum
  implements ICommandHandler<UpdateActionDTOcurriculum>
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
    command: UpdateActionDTOcurriculum,
  ): Promise<Curriculum> {
    const curriculumExists = await this.curriculum.findByPk(command.Id);
    if (!curriculumExists) {
      throw new Error('curriculum not found');
    }
    Object.assign(curriculumExists, command);
    await curriculumExists.save();
    await this.elasticsearchService.update({
      index: 'curriculum',
      id: command.Id,
      body: {
        doc: curriculumExists,
      },
    });
    return curriculumExists;
  }
}
