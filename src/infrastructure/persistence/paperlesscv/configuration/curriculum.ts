import {
  Model,
  Index,
  Table,
  HasOne,
  Column,
  Default,
  HasMany,
  DataType,
  BelongsTo,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({ tableName: 'curriculum', timestamps: false })
export class Curriculum extends Model<Curriculum> {
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  @Index({ name: 'paperlesscv_curriculum_Id_Index', unique: true })
  public Id: string;

  @Column({ type: DataType.STRING() })
  @Index({ name: 'paperlesscv_curriculum_fullName_Index', unique: true })
  public fullName: string;

  @Column({ type: DataType.STRING() })
  @Index({ name: 'paperlesscv_curriculum_emailAddress_Index', unique: true })
  public emailAddress: string;

  @Column({ type: DataType.STRING() })
  @Index({ name: 'paperlesscv_curriculum_phone_Index', unique: true })
  public phone: string;

  @Column({ type: DataType.STRING() })
  public Address: string;

  @Column({ type: DataType.STRING() })
  public professionalProfile: string;

  @Column({ type: DataType.STRING() })
  public certifiedTittle: string;

  @Column({ type: DataType.STRING() })
  public institution: string;

  @Column({ type: DataType.DATE() })
  public studyStartDate: Date;

  @Column({ type: DataType.DATE() })
  public studyEndDate: Date;

  @Column({ type: DataType.STRING() })
  public jobPosition: string;

  @Column({ type: DataType.STRING() })
  public company: string;

  @Column({ type: DataType.DATE() })
  public companyStartDate: Date;

  @Column({ type: DataType.DATE() })
  public companyEndDate: Date;

  @Column({ type: DataType.STRING() })
  public professionalSkills: string;

  @Column({ type: DataType.STRING() })
  public languages: string;
}
