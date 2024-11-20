import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUnitDto {
  @IsString()
  @ApiProperty({ description: 'The name of the unit' })
  @IsNotEmpty({ message: 'Unit name cannot be empty or a blank string' })
  name: string;
}
