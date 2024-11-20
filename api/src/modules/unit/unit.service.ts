import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitDto } from './create-unit.dto';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  async createUnit(data: CreateUnitDto) {
    const unit = await this.prisma.unit.findFirst({
      where: { name: data.name },
    });
    if (unit) {
      throw new BadRequestException('单位已存在');
    }
    return this.prisma.unit.create({
      data,
    });
  }

  async deleteUnit(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException('单位不存在');
    }
    return this.prisma.unit.delete({ where: { id } });
  }

  async deleteMultipleUnits(ids: string[]) {
    const units = await this.prisma.unit.findMany({
      where: { id: { in: ids } },
    });

    if (units.length !== ids.length) {
      throw new NotFoundException('一个或多个单位不存在');
    }

    return this.prisma.unit.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async findUnit(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException('单位不存在');
    }
    return unit;
  }

  async getAllUnits(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [units, total] = await Promise.all([
      this.prisma.unit.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.unit.count(),
    ]);

    return {
      data: units,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async updateUnit(id: string, data: CreateUnitDto) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException('单位不存在');
    }

    if (data.name) {
      const unitExistedByName = await this.prisma.unit.findFirst({
        where: {
          name: data.name,
          id: { not: id }, // Ensure it's not the current unit
        },
      });

      if (unitExistedByName) {
        throw new BadRequestException('单位名称已存在');
      }
    }

    return this.prisma.unit.update({
      where: { id },
      data,
    });
  }

  async getAllUnitsWithoutPagination() {
    const units = await this.prisma.unit.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data: units };
  }
}
