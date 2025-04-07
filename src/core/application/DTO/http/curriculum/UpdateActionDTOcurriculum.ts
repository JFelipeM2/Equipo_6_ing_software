import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsOptional,
  IsObject,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsBoolean,
  IsEmail,
  IsUUID,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateActionDTOcurriculum {
  @IsUUID()
  @ApiProperty()
  public Id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  @ApiProperty()
  public fullName: string;

  @IsString()
  @ApiProperty()
  public emailAddress: string;

  @IsNumber()
  @ApiProperty()
  public phone: string;

  @IsString()
  @ApiProperty()
  public Address: string;

  @IsString()
  @ApiProperty()
  public professionalProfile: string;

  @IsString()
  @ApiProperty()
  public certifiedTittle: string;

  @IsString()
  @ApiProperty()
  public institution: string;

  @ApiProperty()
  public studyStartDate: Date;

  @ApiProperty()
  public studyEndDate: Date;

  @IsString()
  @ApiProperty()
  public jobPosition: string;

  @IsString()
  @ApiProperty()
  public company: string;

  @ApiProperty()
  public companyStartDate: Date;

  @ApiProperty()
  public companyEndDate: Date;

  @IsString()
  @ApiProperty()
  public professionalSkills: string;

  @IsString()
  @ApiProperty()
  public languages: string;
}
