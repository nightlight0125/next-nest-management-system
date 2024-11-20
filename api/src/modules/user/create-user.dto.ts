import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({ description: 'The username of the user' })
  @IsNotEmpty({ message: 'Username cannot be empty or a blank string' })
  username: string;

  @IsString()
  @ApiProperty({ description: 'The password of the user' })
  @IsNotEmpty({ message: 'Password cannot be empty or a blank string' })
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'The unit id of the user', required: false })
  @IsOptional()
  unitId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'The role id of the user', required: false })
  @IsOptional()
  roleId?: string;
}
