import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from '../auth/DTO/register.dto';
import { CreateUserDto } from './create-user.dto';
import { EventsGateway } from '../../events/events.gateway';

// import Redis from 'ioredis';
// import { AuthService } from '../auth/auth.service';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    // private redisClient: Redis,
    // private authService: AuthService,
  ) {}

  async register(data: RegisterDto) {
    const user = await this.findByUsername(data.username);
    if (user) {
      throw new BadRequestException('用户名已存在');
    }

    if (data.unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: data.unitId },
      });
      if (!unit) {
        throw new NotFoundException('单位不存在');
      }
    }

    if (data.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: data.roleId },
      });
      if (!role) {
        throw new NotFoundException('角色不存在');
      }
    }

    return this.prisma.user.create({
      data: {
        username: data.username,
        password: data.password,
        ...(data.roleId ? { role: { connect: { id: data.roleId } } } : {}),
        ...(data.unitId ? { unit: { connect: { id: data.unitId } } } : {}),
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            roleMenus: {
              include: {
                menu: true,
              },
            },
          },
        },
        unit: true,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    this.eventsGateway.notifyUserLogout(id, 'delete');
    return this.prisma.user.delete({ where: { id } });
  }

  async deleteMultipleUsers(ids: string[]) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    if (users.length !== ids.length) {
      throw new NotFoundException('一个或多个用户不存在');
    }

    ids.forEach((id) => {
      this.eventsGateway.notifyUserLogout(id, 'delete');
    });

    return this.prisma.user.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async findUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        unit: true,
      },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return { data: user };
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          role: true,
          unit: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async updateUser(id: string, data: CreateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (data.username) {
      const userExistedByUsername = await this.prisma.user.findFirst({
        where: {
          username: data.username,
          id: { not: id }, // Ensure it's not the current user
        },
      });

      if (userExistedByUsername) {
        throw new BadRequestException('用户名已存在');
      }
    }

    if (data.unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: data.unitId },
      });
      if (!unit) {
        throw new NotFoundException('单位不存在');
      }
    }

    if (data.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: data.roleId },
      });
      if (!role) {
        throw new NotFoundException('角色不存在');
      }
    }

    if (data.password && data.password !== user.password) {
      // Password has been modified, notify the user to logout
      this.eventsGateway.notifyUserLogout(id, 'update');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
