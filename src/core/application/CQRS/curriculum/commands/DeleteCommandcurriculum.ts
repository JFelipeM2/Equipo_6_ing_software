import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectModel } from '@nestjs/sequelize';
import { Curriculum } from '../../../../../infrastructure/persistence/paperlesscv/configuration/curriculum';
import { DeleteActionDTOcurriculum } from '../../../DTO/http/curriculum/DeleteActionDTOcurriculum';

@CommandHandler(DeleteActionDTOcurriculum)
export class DeleteCommandcurriculum
  implements ICommandHandler<DeleteActionDTOcurriculum>
{
  constructor(
    @InjectModel(
      Curriculum,
      new ConfigService().get<string>('database_database_name'),
    )
    private readonly curriculum: typeof Curriculum,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  public async execute(command: DeleteActionDTOcurriculum): Promise<boolean> {
    const curriculumExists = await this.curriculum.findByPk(command.Id);
    if (!curriculumExists) {
      throw new Error('curriculum not found');
    }
    await this.curriculum.destroy({
      where: {
        Id: command.Id,
      },
    });
    await this.elasticsearchService.delete({
      index: 'curriculum',
      id: command.Id,
    });
    return true;
  }
}
