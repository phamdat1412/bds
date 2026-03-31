import prisma from "../../configs/prisma.js";
import { hashPassword } from "../../utils/password.js";
import { CreateStaffInput, UserListQuery } from "./users.types.js";

export async function createStaff(input: CreateStaffInput) {
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;
  const roleCode = input.roleCode.trim().toLowerCase();

  if (email) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      throw new Error("Email already exists");
    }
  }

  if (phone) {
    const existingByPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingByPhone) {
      throw new Error("Phone already exists");
    }
  }

  const role = await prisma.role.findUnique({
    where: { code: roleCode },
  });

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
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return {
    id: createdUser.id.toString(),
    email: createdUser.email,
    phone: createdUser.phone,
    userType: createdUser.userType,
    status: createdUser.status,
    roles: createdUser.roles.map((item) => ({
      id: item.role.id.toString(),
      code: item.role.code,
      name: item.role.name,
    })),
  };
}

// export async function listUsers(query: UserListQuery) {
//   const keyword = query.keyword?.trim() || undefined;

//   const users = await prisma.user.findMany({
//     where: {
//       ...(query.userType ? { userType: query.userType } : {}),
//       ...(query.status ? { status: query.status } : {}),
//       ...(keyword
//         ? {
//             OR: [
//               { email: { contains: keyword } },
//               { phone: { contains: keyword } },
//               {
//                 customerProfile: {
//                   fullName: { contains: keyword },
//                 },
//               },
//             ],
//           }
//         : {}),
//     },
//     include: {
//       customerProfile: true,
//       roles: {
//         include: {
//           role: true,
//         },
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return users.map((user) => ({
//     id: user.id.toString(),
//     email: user.email,
//     phone: user.phone,
//     userType: user.userType,
//     status: user.status,
//     lastLoginAt: user.lastLoginAt,
//     createdAt: user.createdAt,
//     customerProfile: user.customerProfile
//       ? {
//           id: user.customerProfile.id.toString(),
//           fullName: user.customerProfile.fullName,
//           source: user.customerProfile.source,
//           province: user.customerProfile.province,
//         }
//       : null,
//     roles: user.roles.map((item) => ({
//       id: item.role.id.toString(),
//       code: item.role.code,
//       name: item.role.name,
//     })),
//   }));
// }
import { buildPaginationMeta } from "../../utils/pagination.js";

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
    items: users.map((user) => ({
      id: user.id.toString(),
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      customerProfile: user.customerProfile
        ? {
            id: user.customerProfile.id.toString(),
            fullName: user.customerProfile.fullName,
            source: user.customerProfile.source,
            province: user.customerProfile.province,
          }
        : null,
      roles: user.roles.map((item) => ({
        id: item.role.id.toString(),
        code: item.role.code,
        name: item.role.name,
      })),
    })),
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
  input: {
    fullName?: string;
    email?: string;
    phone?: string;
  }
) {
  const existingUser = await prisma.user.findUnique({
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

  if (!existingUser) {
    throw new Error("User not found");
  }

  const trimmedFullName = input.fullName?.trim();

  if (!existingUser.customerProfile && !trimmedFullName) {
    throw new Error("Full name is required");
  }

  const customerProfileData = existingUser.customerProfile
    ? {
        update: {
          ...(input.fullName !== undefined && trimmedFullName
            ? { fullName: trimmedFullName }
            : {}),
        },
      }
    : {
        create: {
          fullName: trimmedFullName!,
        },
      };

  const updatedUser = await prisma.user.update({
    where: { id: BigInt(userId) },
    data: {
      ...(input.email !== undefined
        ? { email: input.email?.trim().toLowerCase() || null }
        : {}),
      ...(input.phone !== undefined
        ? { phone: input.phone?.trim() || null }
        : {}),
      customerProfile: customerProfileData,
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