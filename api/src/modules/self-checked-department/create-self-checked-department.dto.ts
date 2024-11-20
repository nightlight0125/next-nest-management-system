import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateSelfCheckedDepartmentDto {
  @IsString()
  @ApiProperty({ description: 'yearMonth' })
  @IsNotEmpty({ message: 'yearMonth is required' })
  yearMonth: string;
}
