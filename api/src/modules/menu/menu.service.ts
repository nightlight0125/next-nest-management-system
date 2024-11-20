import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async createMenu(data: { name: string; path: string; description?: string }) {
    const menuExisted = await this.prisma.menu.findFirst({
      where: { path: data.path },
    });

    if (menuExisted) {
      throw new BadRequestException('菜单路径已存在');
    }

    return this.prisma.menu.create({ data });
  }

  async deleteMenu(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return this.prisma.menu.delete({ where: { id } });
  }

  async deleteMultipleMenus(ids: string[]) {
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: ids } },
    });

    if (menus.length !== ids.length) {
      throw new NotFoundException('一个或多个菜单不存在');
    }

    return this.prisma.menu.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async findMenu(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  async getAllMenus(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [menus, total] = await Promise.all([
      this.prisma.menu.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.menu.count(),
    ]);

    return {
      data: menus,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async updateMenu(
    id: string,
    data: {
      name?: string;
      path?: string;
      description?: string;
    },
  ) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    if (data.path) {
      const menuExistedByPath = await this.prisma.menu.findFirst({
        where: {
          path: data.path,
          id: { not: id }, // Ensure it's not the current menu
        },
      });

      if (menuExistedByPath) {
        throw new BadRequestException('菜单路径已存在');
      }
    }

    return this.prisma.menu.update({ where: { id }, data });
  }

  async getAllMenusWithoutPagination() {
    const menus = await this.prisma.menu.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data: menus };
  }
}
