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
import { UnitService } from './unit.service';
import { CreateUnitDto } from './create-unit.dto';

@ApiTags('Unit')
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiBody({ type: CreateUnitDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() body: CreateUnitDto) {
    return this.unitService.createUnit(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all units without pagination' })
  async getAllUnitsWithoutPagination() {
    return this.unitService.getAllUnitsWithoutPagination();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  async delete(@Param('id') id: string) {
    return this.unitService.deleteUnit(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple units' })
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
    return this.unitService.deleteMultipleUnits(body.ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a unit' })
  async find(@Param('id') id: string) {
    return this.unitService.findUnit(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.unitService.getAllUnits(page, limit);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiBody({ type: CreateUnitDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() body: CreateUnitDto) {
    return this.unitService.updateUnit(id, body);
  }
}
