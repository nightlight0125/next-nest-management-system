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
  Res,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { RegisterDto } from '../auth/DTO/register.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() body: RegisterDto) {
    return this.userService.register(body);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple users' })
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
    return this.userService.deleteMultipleUsers(body.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  async delete(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a user' })
  async find(@Param('id') id: string) {
    return this.userService.findUser(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.userService.getAllUsers(page, limit);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({ type: CreateUserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() body: CreateUserDto) {
    return this.userService.updateUser(id, body);
  }
}
