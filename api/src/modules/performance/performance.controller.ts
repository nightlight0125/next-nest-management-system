import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import {
  CreateCurrentYearMonthUnitPerformanceDto,
  UpdateCurrentYearMonthUnitPerformanceDto,
} from './create-current-year-month-unit-performance.dto';

@ApiTags('UnitPerformance')
@Controller('current-year-month-unit-performance')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new performance record' })
  @ApiBody({ type: CreateCurrentYearMonthUnitPerformanceDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() body: CreateCurrentYearMonthUnitPerformanceDto) {
    return this.service.create(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all performances without pagination' })
  @ApiQuery({ name: 'month', type: String, required: false })
  async getAllWithoutPagination(@Query('month') month?: string) {
    return this.service.getAllWithoutPagination(month);
  }

  @Get('allYear')
  @ApiOperation({ summary: 'Get all year performances without pagination' })
  @ApiQuery({ name: 'year', type: String, required: false })
  async getAllYearWithoutPagination(@Query('year') year?: string) {
    return this.service.getAllYearWithoutPagination(year);
  }

  @Get()
  @ApiOperation({ summary: 'Get all performances' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('month') month?: string,
  ) {
    return this.service.findAll(page, limit, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a performance record' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a performance record' })
  @ApiBody({ type: UpdateCurrentYearMonthUnitPerformanceDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCurrentYearMonthUnitPerformanceDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a performance record' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple performance records' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { ids: { type: 'array', items: { type: 'string' } } },
    },
  })
  async removeMultiple(@Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException(
        'Invalid request: ids must be a non-empty array',
      );
    }
    return this.service.removeMultiple(body.ids);
  }
}
