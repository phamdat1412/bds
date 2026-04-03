import prisma from "../../configs/prisma.js";
import { hashPassword } from "../../utils/password.js";
import { buildPaginationMeta } from "../../utils/pagination.js";
import {
  CreateStaffInput,
  UpdateMyCustomerProfileInput,
  UpdateUserInput,
  UserListQuery,
} from "./users.types.js";

function mapUserResponse(user: any) {
  return {
    id: user.id.toString(),
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    customerProfile: user.customerProfile
      ? {
          id: user.customerProfile.id.toString(),
          fullName: user.customerProfile.fullName,
          source: user.customerProfile.source ?? null,
          province: user.customerProfile.province ?? null,
          createdAt: user.customerProfile.createdAt,
          updatedAt: user.customerProfile.updatedAt,
        }
      : null,
    roles: user.roles.map((item: any) => ({
      id: item.role.id.toString(),
      code: item.role.code,
      name: item.role.name,
    })),
  };
}

async function findRoleByCode(roleCode: string) {
  return prisma.role.findUnique({
    where: { code: roleCode.trim().toLowerCase() },
  });
}

async function ensureUniqueEmailAndPhone(params: {
  email?: string | null;
  phone?: string | null;
  excludeUserId?: bigint;
}) {
  const { email, phone, excludeUserId } = params;

  if (email) {
    const existingByEmail = await prisma.user.findFirst({
      where: {
        email,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
    });

    if (existingByEmail) {
      throw new Error("Email already exists");
    }
  }

  if (phone) {
    const existingByPhone = await prisma.user.findFirst({
      where: {
        phone,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
    });

    if (existingByPhone) {
      throw new Error("Phone already exists");
    }
  }
}

export async function createStaff(input: CreateStaffInput) {
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;
  const roleCode = input.roleCode.trim().toLowerCase();

  await ensureUniqueEmailAndPhone({ email, phone });

  const role = await findRoleByCode(roleCode);

  if (!role) {
    throw new Error("Role not found");
  }

  const passwordHash = await hashPassword(input.password);

  const createdUser = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      userType: "staff",
      status: "active",
      roles: {
        create: {
          roleId: role.id,
        },
      },
    },
    include: {
      customerProfile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return mapUserResponse(createdUser);
}

export async function listUsers(query: UserListQuery) {
  const keyword = query.keyword?.trim() || undefined;
  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where = {
    ...(query.userType ? { userType: query.userType } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(keyword
      ? {
          OR: [
            { email: { contains: keyword } },
            { phone: { contains: keyword } },
            {
              customerProfile: {
                fullName: { contains: keyword },
              },
            },
          ],
        }
      : {}),
  };

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        customerProfile: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users.map(mapUserResponse),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function getMyCustomerProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    include: {
      customerProfile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id.toString(),
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    status: user.status,
    roles: user.roles.map((item) => item.role.code),
    customerProfile: user.customerProfile
      ? {
          id: user.customerProfile.id.toString(),
          fullName: user.customerProfile.fullName,
          createdAt: user.customerProfile.createdAt,
          updatedAt: user.customerProfile.updatedAt,
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateMyCustomerProfile(
  userId: string,
  input: UpdateMyCustomerProfileInput
) {
  const userIdBigInt = BigInt(userId);

  const existingUser = await prisma.user.findUnique({
    where: { id: userIdBigInt },
    include: {
      customerProfile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const email =
    input.email !== undefined
      ? input.email?.trim().toLowerCase() || null
      : undefined;

  const phone =
    input.phone !== undefined
      ? input.phone?.trim() || null
      : undefined;

  const trimmedFullName = input.fullName?.trim();

  await ensureUniqueEmailAndPhone({
    email,
    phone,
    excludeUserId: userIdBigInt,
  });

  const data: any = {
    ...(input.email !== undefined ? { email } : {}),
    ...(input.phone !== undefined ? { phone } : {}),
  };

  if (existingUser.customerProfile) {
    if (input.fullName !== undefined && trimmedFullName) {
      data.customerProfile = {
        update: {
          fullName: trimmedFullName,
        },
      };
    }
  } else {
    if (!trimmedFullName) {
      throw new Error("Full name is required");
    }

    data.customerProfile = {
      create: {
        fullName: trimmedFullName,
      },
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userIdBigInt },
    data,
    include: {
      customerProfile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return {
    id: updatedUser.id.toString(),
    email: updatedUser.email,
    phone: updatedUser.phone,
    userType: updatedUser.userType,
    status: updatedUser.status,
    roles: updatedUser.roles.map((item) => item.role.code),
    customerProfile: updatedUser.customerProfile
      ? {
          id: updatedUser.customerProfile.id.toString(),
          fullName: updatedUser.customerProfile.fullName,
          createdAt: updatedUser.customerProfile.createdAt,
          updatedAt: updatedUser.customerProfile.updatedAt,
        }
      : null,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
}

export async function updateUserByAdmin(userId: string, input: UpdateUserInput) {
  const userIdBigInt = BigInt(userId);

  const existingUser = await prisma.user.findUnique({
    where: { id: userIdBigInt },
    include: {
      customerProfile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const email =
    input.email !== undefined
      ? input.email?.trim().toLowerCase() || null
      : undefined;

  const phone =
    input.phone !== undefined
      ? input.phone?.trim() || null
      : undefined;

  const fullName = input.fullName?.trim();

  await ensureUniqueEmailAndPhone({
    email,
    phone,
    excludeUserId: userIdBigInt,
  });

  const data: any = {
    ...(input.email !== undefined ? { email } : {}),
    ...(input.phone !== undefined ? { phone } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };

  if (input.password && input.password.trim()) {
    data.passwordHash = await hashPassword(input.password);
  }

  if (input.fullName !== undefined) {
    if (existingUser.customerProfile) {
      if (fullName) {
        data.customerProfile = {
          update: {
            fullName,
          },
        };
      }
    } else if (fullName) {
      data.customerProfile = {
        create: {
          fullName,
        },
      };
    }
  }

  await prisma.user.update({
    where: { id: userIdBigInt },
    data,
  });

  if (input.roleCode !== undefined && existingUser.userType === "staff") {
    const role = await findRoleByCode(input.roleCode);

    if (!role) {
      throw new Error("Role not found");
    }

    await prisma.userRole.deleteMany({
      where: { userId: userIdBigInt },
    });

    await prisma.userRole.create({
      data: {
        userId: userIdBigInt,
        roleId: role.id,
      },
    });
  }

  const finalUser = await prisma.user.findUnique({
    where: { id: userIdBigInt },
    include: {
      customerProfile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!finalUser) {
    throw new Error("User not found after update");
  }

  return mapUserResponse(finalUser);
}

export async function deleteUserByAdmin(userId: string) {
  const userIdBigInt = BigInt(userId);

  const existingUser = await prisma.user.findUnique({
    where: { id: userIdBigInt },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userIdBigInt },
    data: {
      status: "blocked",
    },
    include: {
      customerProfile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return mapUserResponse(updatedUser);
}