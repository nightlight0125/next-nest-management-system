import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @ApiProperty({ description: 'The name of the menu' })
  @IsNotEmpty({ message: 'Menu name cannot be empty or a blank string' })
  name: string;

  @IsString()
  @ApiProperty({ description: 'The path of the menu' })
  @IsNotEmpty({ message: 'Path cannot be empty or a blank string' })
  path: string;

  @IsString()
  @ApiProperty({ description: 'The description of the menu', required: false })
  @IsOptional()
  description?: string;
}
