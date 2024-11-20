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
import { SelfCheckedDepartmentService } from './self-checked-department.service';

@ApiTags('PerformanceList')
@Controller('self-checked-department')
export class SelfCheckedDepartmentController {
  constructor(private readonly service: SelfCheckedDepartmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all self-checked department records' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.service.findAll(page, limit);
  }

  @Get(':month')
  @ApiOperation({ summary: 'Find a self-checked department record' })
  async findOne(@Param('month') month: string) {
    return this.service.findOne(month);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a self-checked department record' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple self-checked department records' })
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
