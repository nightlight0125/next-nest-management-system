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
  BadRequestException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './create-menu.dto';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu' })
  @ApiBody({ type: CreateMenuDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() body: CreateMenuDto) {
    return this.menuService.createMenu(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all menus without pagination' })
  async getAllMenusWithoutPagination() {
    return this.menuService.getAllMenusWithoutPagination();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu' })
  async delete(@Param('id') id: string) {
    return this.menuService.deleteMenu(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple menus' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ids: { type: 'array', items: { type: 'string' } } },
    },
  })
  async deleteMultiple(@Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException(
        'Invalid request: ids must be a non-empty array',
      );
    }
    return this.menuService.deleteMultipleMenus(body.ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a menu' })
  async find(@Param('id') id: string) {
    return this.menuService.findMenu(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menus' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.menuService.getAllMenus(page, limit);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a menu' })
  @ApiBody({ type: CreateMenuDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() body: CreateMenuDto) {
    return this.menuService.updateMenu(id, body);
  }
}
