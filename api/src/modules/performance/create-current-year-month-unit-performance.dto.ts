import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsJSON,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

interface PerUnitSelfCheckedCondition {
  id: string;
  responsiblePerson: string;
  responsiblePersonScore: string;
  responsiblePersonRemark: string;
}

interface ExaminationCondition {
  id: string;
  examinationContent: string;
  examinationScore: string;
  relatedSelfCheckedID: string;
}

interface ReviewStateOfPerformanceTeam {
  id: string;
  examinationContent: string;
  examinationScore: string;
  relatedExaminationID: string;
}

export class CreateCurrentYearMonthUnitPerformanceDto {
  @IsString()
  @ApiProperty({ description: 'The id of the unit' })
  @IsNotEmpty({ message: 'Unit id cannot be empty or a blank string' })
  unitId: string;

  @IsString()
  @ApiProperty({ description: 'The id of the create person' })
  @IsNotEmpty({ message: 'Create person id cannot be empty or a blank string' })
  createPersonId: string;

  @IsString()
  @ApiProperty({ description: 'The year month of the performance' })
  @IsNotEmpty({ message: 'Year month cannot be empty or a blank string' })
  yearMonth: string;

  @IsNumber()
  @ApiProperty({ description: 'The self checked score of the performance' })
  @IsNotEmpty({
    message: 'Self checked score cannot be empty or a blank string',
  })
  selfCheckedScore: number;

  @IsJSON()
  @ApiProperty({
    description: 'The per unit self checked condition of the performance',
  })
  @IsNotEmpty({
    message:
      'Per unit self checked condition cannot be empty or a blank string',
  })
  perUnitSelfCheckedCondition: JSON;
}

export class UpdateCurrentYearMonthUnitPerformanceDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The id of the edit person' })
  editPersonId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The id of the audit person' })
  auditPersonId?: string;

  @IsOptional()
  @IsJSON()
  @ApiProperty({
    description: 'The examination condition of the performance',
  })
  examinationCondition?: JSON;

  @IsOptional()
  @IsJSON()
  @ApiProperty({
    description: 'The review state of the performance team',
  })
  reviewStateOfPerformanceTeam?: JSON;
}
