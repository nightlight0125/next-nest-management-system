import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @ApiProperty({ description: 'The name of the role' })
  @IsNotEmpty({ message: 'Role name cannot be empty or a blank string' })
  name: string;

  @IsArray()
  @ApiProperty({ description: 'The menus of the role', required: false })
  @IsOptional()
  menuIds?: string[];
}
