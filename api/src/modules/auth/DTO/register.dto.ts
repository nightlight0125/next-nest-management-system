import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Username cannot be empty or a blank string' })
  username: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty or a blank string' })
  password: string;

  @ApiProperty({
    description: 'The role id of the user',
    required: false,
  })
  @IsOptional()
  roleId?: string;

  @ApiProperty({
    description: 'The unit id of the user',
    required: false,
  })
  @IsOptional()
  unitId?: string;
}
