import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  Get,
  Put,
  UsePipes,
  ValidationPipe,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './create-role.dto';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() body: CreateRoleDto) {
    return this.roleService.createRole(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all roles without pagination' })
  async getAllRolesWithoutPagination() {
    return this.roleService.getAllRolesWithoutPagination();
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple roles' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ids: { type: 'array', items: { type: 'string' } } },
    },
  })
  async deleteMultiple(@Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('请求无效: ids 必须是一个非空数组');
    }
    return this.roleService.deleteMultipleRoles(body.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  async delete(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a role' })
  async find(@Param('id') id: string) {
    return this.roleService.findRole(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.roleService.getAllRoles(page, limit);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiBody({ type: CreateRoleDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() body: CreateRoleDto) {
    return this.roleService.updateRole(id, body);
  }
}
