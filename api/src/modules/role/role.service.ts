import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async createRole(data: { name: string; menuIds?: string[] }) {
    const { name, menuIds } = data;

    const roleExisted = await this.prisma.role.findFirst({
      where: { name },
    });

    if (roleExisted) {
      throw new BadRequestException('角色已存在');
    }

    return this.prisma.$transaction(async (prisma) => {
      if (menuIds && menuIds.length > 0) {
        const menus = await prisma.menu.findMany({
          where: { id: { in: menuIds } },
        });

        if (menus.length !== menuIds.length) {
          throw new NotFoundException('一个或多个菜单不存在');
        }
      }

      const role = await prisma.role.create({
        data: { name },
      });

      if (menuIds && menuIds.length > 0) {
        const roleMenusData = menuIds.map((menuId) => ({
          roleId: role.id,
          menuId,
        }));

        await prisma.roleMenu.createMany({
          data: roleMenusData,
          skipDuplicates: true,
        });
      }

      const roleMenus = await prisma.roleMenu.findMany({
        where: { roleId: role.id },
        include: {
          menu: true,
        },
      });

      return {
        ...role,
        roleMenus: roleMenus.map((roleMenu) => roleMenu.menu),
      };
    });
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return this.prisma.role.delete({ where: { id } });
  }

  async deleteMultipleRoles(ids: string[]) {
    const roles = await this.prisma.role.findMany({
      where: { id: { in: ids } },
    });

    if (roles.length !== ids.length) {
      throw new NotFoundException('一个或多个角色不存在');
    }

    return this.prisma.role.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async findRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        // Include related menus
        roleMenus: {
          include: {
            menu: true, // Assuming 'menu' is the relation name in the roleMenu model
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return {
      ...role,
      roleMenus: role.roleMenus.map((roleMenu) => roleMenu.menu), // Extract menus from roleMenus
    };
  }

  async getAllRoles(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roleMenus: {
            include: {
              menu: true,
            },
          },
        },
      }),
      this.prisma.role.count(),
    ]);

    return {
      data: roles.map((role) => ({
        ...role,
        roleMenus: role.roleMenus.map((roleMenu) => roleMenu.menu), // Extract menus from roleMenus
      })),
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async updateRole(id: string, data: { name?: string; menuIds?: string[] }) {
    const { name, menuIds } = data;

    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    if (name) {
      const roleExistedByName = await this.prisma.role.findFirst({
        where: { name, id: { not: id } },
      });

      if (roleExistedByName) {
        throw new BadRequestException('角色名称已存在');
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      if (menuIds) {
        const menus = await prisma.menu.findMany({
          where: { id: { in: menuIds } },
        });

        if (menus.length !== menuIds.length) {
          throw new NotFoundException('一个或多个菜单不存在');
        }

        await prisma.roleMenu.deleteMany({ where: { roleId: id } });

        if (menuIds.length > 0) {
          const roleMenusData = menuIds.map((menuId) => ({
            roleId: id,
            menuId,
          }));

          await prisma.roleMenu.createMany({
            data: roleMenusData,
            skipDuplicates: true,
          });
        }
      }

      const updatedRole = await prisma.role.update({
        where: { id },
        data: { name },
        include: {
          roleMenus: {
            include: {
              menu: true,
            },
          },
        },
      });

      return {
        ...updatedRole,
        roleMenus: updatedRole.roleMenus.map((roleMenu) => roleMenu.menu),
      };
    });
  }

  async getAllRolesWithoutPagination() {
    const roles = await this.prisma.role.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data: roles };
  }
}
