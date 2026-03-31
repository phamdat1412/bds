import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import prisma from "../../configs/prisma.js";
type RegisterInput = {
  email?: string;
  phone?: string;
  password: string;
  fullName?: string;
};

type LoginInput = {
  email?: string;
  phone?: string;
  password: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function getJwtExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"];
}

function buildTokenPayload(user: {
  id: bigint;
  email: string | null;
  userType: string;
  roles: Array<{ role: { code: string } }>;
}) {
  return {
    userId: user.id.toString(),
    email: user.email,
    userType: user.userType,
    roles: user.roles.map((item) => item.role.code),
  };
}

function getRedirectTo(roleCodes: string[]) {
  if (roleCodes.includes("admin")) {
    return "/admin/dashboard";
  }

  if (roleCodes.includes("seller")) {
    return "/seller/dashboard";
  }

  return "/user";
}

function mapAuthUser(user: {
  id: bigint;
  email: string | null;
  phone: string | null;
  userType: string;
  status: string;
  roles: Array<{ role: { code: string; name: string } }>;
}) {
  const roleCodes = user.roles.map((item) => item.role.code);

  return {
    user: {
      id: user.id.toString(),
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      status: user.status,
    },
    roles: roleCodes,
    redirectTo: getRedirectTo(roleCodes),
  };
}

export async function register(input: RegisterInput) {
  if (!input.email && !input.phone) {
    throw new Error("Email or phone is required");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(input.email ? [{ email: input.email.trim().toLowerCase() }] : []),
        ...(input.phone ? [{ phone: input.phone.trim() }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email?.trim().toLowerCase() || null,
      phone: input.phone?.trim() || null,
      passwordHash,
      userType: "customer",
      status: "active",
      customerProfile: input.fullName?.trim()
        ? {
            create: {
              fullName: input.fullName.trim(),
            },
          }
        : undefined,
    },
  });

  const customerRole = await prisma.role.findUnique({
    where: { code: "customer" },
  });

  if (!customerRole) {
    throw new Error("Customer role not found");
  }

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: customerRole.id,
    },
  });

  const userWithRoles = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!userWithRoles) {
    throw new Error("User not found after register");
  }

  const tokenPayload = buildTokenPayload(userWithRoles);
  const accessToken = jwt.sign(tokenPayload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });

  return {
    accessToken,
    ...mapAuthUser(userWithRoles),
  };
}

export async function login(input: LoginInput) {
  if (!input.email && !input.phone) {
    throw new Error("Email or phone is required");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(input.email ? [{ email: input.email.trim().toLowerCase() }] : []),
        ...(input.phone ? [{ phone: input.phone.trim() }] : []),
      ],
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status !== "active") {
    throw new Error("User is inactive");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });

  const tokenPayload = buildTokenPayload(user);
  const accessToken = jwt.sign(tokenPayload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });

  return {
    accessToken,
    ...mapAuthUser(user),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    include: {
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

  return mapAuthUser(user);
}