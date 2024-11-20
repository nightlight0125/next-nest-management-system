import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCurrentYearMonthUnitPerformanceDto,
  UpdateCurrentYearMonthUnitPerformanceDto,
} from './create-current-year-month-unit-performance.dto';
import { SelfCheckedDepartmentService } from '../self-checked-department/self-checked-department.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PerformanceService {
  constructor(
    private prisma: PrismaService,
    private selfCheckedDepartmentService: SelfCheckedDepartmentService,
  ) {}

  async create(data: CreateCurrentYearMonthUnitPerformanceDto) {
    const { unitId, createPersonId } = data;

    // Verify if the unitId exists
    const unitExists = await this.prisma.unit.findUnique({
      where: { id: unitId },
    });
    if (!unitExists) {
      throw new BadRequestException('无法找到该单位');
    }

    // Verify if the createPersonId exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: createPersonId, unitId },
    });
    if (!userExists) {
      throw new BadRequestException('请使用正确的账号登录');
    }

    const performanceExists =
      await this.prisma.currentYearMonthUnitPerformance.findFirst({
        where: { yearMonth: data.yearMonth, unitId },
      });

    if (performanceExists) {
      throw new BadRequestException('绩效已存在');
    }

    return this.prisma.$transaction(async (prisma) => {
      const selfCheckedDepartment =
        await this.selfCheckedDepartmentService.create({
          prismaTransaction: prisma,
          yearMonth: data.yearMonth,
        });

      if (typeof data.perUnitSelfCheckedCondition === 'string') {
        const perUnitSelfCheckedCondition = JSON.parse(
          data.perUnitSelfCheckedCondition,
        );
        return prisma.currentYearMonthUnitPerformance.create({
          data: {
            ...data,
            selfCheckedDepartmentId: selfCheckedDepartment.id,
            perUnitSelfCheckedCondition: perUnitSelfCheckedCondition.map(
              (item) => ({
                ...item,
                id: uuidv4(),
              }),
            ),
          },
        });
      }

      throw new BadRequestException('自查情况格式错误');
    });
  }

  async update(id: string, data: UpdateCurrentYearMonthUnitPerformanceDto) {
    const performance =
      await this.prisma.currentYearMonthUnitPerformance.findUnique({
        where: { id },
      });

    if (!performance) {
      throw new NotFoundException('绩效不存在');
    }

    const selfCheckedDepartment =
      await this.prisma.selfCheckedDepartment.findUnique({
        where: { id: performance.selfCheckedDepartmentId },
      });

    if (!selfCheckedDepartment) {
      throw new NotFoundException('自查部门不存在');
    }

    // Verify if the editPersonId exists
    const userExists = await this.prisma.user.findUnique({
      where: {
        id: data.editPersonId || data.auditPersonId,
        unitId: performance.unitId,
      },
    });
    if (!userExists) {
      throw new BadRequestException('请使用正确的账号登录');
    }

    // Start a transaction if atomicity is required
    return this.prisma.$transaction(async (prisma) => {
      // Do not update selfCheckedDepartment
      // await this.selfCheckedDepartmentService.update(
      //   prisma,
      //   selfCheckedDepartment.id,
      // );

      const dataToUpdate: {
        examinationCondition?: string;
        reviewStateOfPerformanceTeam?: string;
        editPersonId?: string;
        auditPersonId?: string;
      } = {};

      if (
        !performance.examinationCondition &&
        data.examinationCondition &&
        typeof data.examinationCondition === 'string'
      ) {
        const examinationCondition = JSON.parse(data.examinationCondition);
        dataToUpdate.editPersonId = data.editPersonId;
        dataToUpdate.examinationCondition = examinationCondition.map(
          (item) => ({
            ...item,
            id: uuidv4(),
          }),
        );

        return prisma.currentYearMonthUnitPerformance.update({
          where: { id },
          data: dataToUpdate,
        });
      }

      if (
        !performance.examinationCondition &&
        data.reviewStateOfPerformanceTeam
      ) {
        throw new BadRequestException('请先创建检查条件');
      }

      if (
        !performance.reviewStateOfPerformanceTeam &&
        data.reviewStateOfPerformanceTeam &&
        typeof data.reviewStateOfPerformanceTeam === 'string'
      ) {
        dataToUpdate.auditPersonId = data.auditPersonId;
        const reviewStateOfPerformanceTeam = JSON.parse(
          data.reviewStateOfPerformanceTeam,
        );
        dataToUpdate.reviewStateOfPerformanceTeam =
          reviewStateOfPerformanceTeam.map((item) => ({
            ...item,
            id: uuidv4(),
          }));
        return prisma.currentYearMonthUnitPerformance.update({
          where: { id },
          data: dataToUpdate,
        });
      }

      if (performance.reviewStateOfPerformanceTeam) {
        throw new BadRequestException('绩效团队审核状态已存在');
      }
      throw new BadRequestException('没有需要更新的内容');
    });
  }

  async findAll(page: number, limit: number, month?: string) {
    const skip = (page - 1) * limit;
    const [performances, total] = await Promise.all([
      month
        ? this.prisma.currentYearMonthUnitPerformance.findMany({
            skip,
            take: limit,
            include: {
              unit: true,
            },
            where: {
              yearMonth: month,
            },
            orderBy: { createdAt: 'desc' },
          })
        : this.prisma.currentYearMonthUnitPerformance.findMany({
            skip,
            take: limit,
            include: {
              unit: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
      month
        ? this.prisma.currentYearMonthUnitPerformance.count({
            where: {
              selfCheckedDepartmentId: month,
            },
          })
        : this.prisma.currentYearMonthUnitPerformance.count(),
    ]);

    return {
      data: performances,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string) {
    const performance =
      await this.prisma.currentYearMonthUnitPerformance.findUnique({
        where: { id },
        include: {
          unit: true,
          createPerson: true,
          editPerson: true,
          auditPerson: true,
        },
      });
    if (!performance) {
      throw new NotFoundException('绩效不存在');
    }
    return performance;
  }

  async remove(id: string) {
    const performance =
      await this.prisma.currentYearMonthUnitPerformance.findUnique({
        where: { id },
      });
    if (!performance) {
      throw new NotFoundException('绩效不存在');
    }

    return this.prisma.$transaction(async (prisma) => {
      const selfCheckedDepartment =
        await prisma.selfCheckedDepartment.findUnique({
          where: { id: performance.selfCheckedDepartmentId },
        });

      await this.selfCheckedDepartmentService.update(
        prisma,
        selfCheckedDepartment.id,
        'minus',
      );

      return prisma.currentYearMonthUnitPerformance.delete({
        where: { id },
      });
    });
  }

  async removeMultiple(ids: string[]) {
    const performances =
      await this.prisma.currentYearMonthUnitPerformance.findMany({
        where: { id: { in: ids } },
      });

    if (performances.length !== ids.length) {
      throw new NotFoundException('一个或多个绩效不存在');
    }

    return this.prisma.$transaction(async (prisma) => {
      await this.selfCheckedDepartmentService.update(
        prisma,
        performances[0].selfCheckedDepartmentId,
        'minus',
        performances.length,
      );
      return prisma.currentYearMonthUnitPerformance.deleteMany({
        where: { id: { in: ids } },
      });
    });
  }

  async getAllWithoutPagination(month?: string) {
    const performances =
      await this.prisma.currentYearMonthUnitPerformance.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          yearMonth: month,
        },
        include: {
          unit: true,
        },
      });
    return { data: performances };
  }

  async getAllYearWithoutPagination(year?: string) {
    const performances =
      await this.prisma.currentYearMonthUnitPerformance.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where: { yearMonth: { startsWith: year } },
        include: {
          unit: true,
        },
      });
    return { data: performances };
  }
}
