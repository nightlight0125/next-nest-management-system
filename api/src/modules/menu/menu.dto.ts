import { ApiProperty } from '@nestjs/swagger';

export class MenuEntity {
  id: number;
  menuName: string;
  path: string;
  description?: string;
}

export class CreateMenuDto {
  @ApiProperty({ description: 'Name of the menu' })
  menuName: string;

  @ApiProperty({ description: 'Path of the menu' })
  path: string;

  @ApiProperty({ description: 'Description of the menu', required: false })
  description?: string;
}

export class UpdateMenuDto {
  @ApiProperty({ description: 'Name of the menu', required: false })
  menuName?: string;

  @ApiProperty({ description: 'Path of the menu', required: false })
  path?: string;

  @ApiProperty({ description: 'Description of the menu', required: false })
  description?: string;
}
