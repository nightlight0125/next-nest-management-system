import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SelfCheckedDepartmentService {
  constructor(private prisma: PrismaService) {}

  async create({
    prismaTransaction,
    yearMonth,
  }: {
    prismaTransaction: any;
    yearMonth: string;
  }) {
    // Check if a record with the same yearMonth already exists
    const existingRecord =
      await prismaTransaction.selfCheckedDepartment.findFirst({
        where: { yearMonth },
      });

    if (existingRecord) {
      return this.update(prismaTransaction, existingRecord.id, 'plus');
    }

    const unitTotal = await prismaTransaction.unit.count();

    return prismaTransaction.selfCheckedDepartment.create({
      data: {
        yearMonth,
        unitTotal,
        numberOfSelfCheckedUnits: 1,
        lastUpdateTime: new Date(),
      },
    });
  }

  async update(
    prisma: any,
    id: string,
    plusOrMinus?: 'plus' | 'minus',
    count?: number,
  ) {
    const department = await prisma.selfCheckedDepartment.findUnique({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('未找到部门');
    }

    let numberOfSelfCheckedUnits = department.numberOfSelfCheckedUnits;
    let lastUpdateTime = department.lastUpdateTime;
    if (plusOrMinus) {
      numberOfSelfCheckedUnits =
        plusOrMinus === 'plus'
          ? department.numberOfSelfCheckedUnits + 1
          : count
            ? department.numberOfSelfCheckedUnits - count
            : department.numberOfSelfCheckedUnits - 1;

      if (plusOrMinus === 'plus') {
        lastUpdateTime = new Date();
      }
    }

    return prisma.selfCheckedDepartment.update({
      where: { id },
      data: {
        numberOfSelfCheckedUnits,
        lastUpdateTime,
      },
    });
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [departments, total] = await Promise.all([
      this.prisma.selfCheckedDepartment.findMany({
        skip,
        take: limit,
        orderBy: { createTime: 'desc' },
      }),
      this.prisma.selfCheckedDepartment.count(),
    ]);

    return {
      data: departments,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(month: string) {
    const department = await this.prisma.selfCheckedDepartment.findFirst({
      where: { yearMonth: month },
    });
    return department || {};
  }

  async remove(id: string) {
    const department = await this.prisma.selfCheckedDepartment.findUnique({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('未找到部门');
    }

    return this.prisma.selfCheckedDepartment.delete({
      where: { id },
    });
  }

  async removeMultiple(ids: string[]) {
    const departments = await this.prisma.selfCheckedDepartment.findMany({
      where: { id: { in: ids } },
    });

    if (departments.length !== ids.length) {
      throw new NotFoundException('一个或多个部门不存在');
    }

    return this.prisma.selfCheckedDepartment.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
