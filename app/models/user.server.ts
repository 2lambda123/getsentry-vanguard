import type { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import invariant from "tiny-invariant";

import { prisma } from "~/services/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByExternalId(externalId: string) {
  return prisma.user.findUnique({ where: { externalId } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserList(
  {
    offset = 0,
    limit = 50,
    query,
  }: {
    offset?: number;
    limit?: number;
    query?: string | null;
  } = {
    offset: 0,
    limit: 50,
  }
) {
  const where: { [key: string]: any } = {};
  if (query !== undefined) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          {
            name: { contains: query, mode: "insensitive" },
          },
          {
            email: { contains: query, mode: "insensitive" },
          },
        ],
      },
    ];
  }

  return prisma.user.findMany({
    skip: offset,
    take: limit,
    where,
    orderBy: {
      email: "asc",
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function upsertUser({
  email,
  externalId,
}: {
  email: User["email"];
  externalId: string;
}) {
  try {
    return await prisma.user.upsert({
      where: {
        externalId,
      },
      update: {
        email,
      },
      create: {
        email,
        externalId,
      },
    });
  } catch (e) {
    // handles a rare case where an externalId was not set
    if (e instanceof PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        return await prisma.user.upsert({
          where: {
            email,
          },
          update: {
            externalId,
          },
          create: {
            email,
            externalId,
          },
        });
      }
    }
    throw e;
  }
}

export async function updateUser({
  id,
  userId,
  admin,
  name,
  picture,
  canPostRestricted,
  notifyReplies,
}: {
  id: User["id"];
  userId: User["id"];
  admin?: User["admin"] | null;
  name?: User["name"] | null;
  picture?: User["picture"] | null;
  canPostRestricted?: User["canPostRestricted"] | undefined;
  notifyReplies?: User["notifyReplies"] | undefined;
}) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  invariant(user, "user not found");

  const data: { [key: string]: any } = {};

  // admin only fields
  if (user.admin) {
    if (admin !== undefined) data.admin = !!admin;
    if (canPostRestricted !== undefined)
      data.canPostRestricted = canPostRestricted;
  }

  if (name !== undefined) data.name = name;
  if (picture !== undefined) data.picture = picture;
  if (notifyReplies !== undefined) data.notifyReplies = notifyReplies;

  return await prisma.user.update({
    where: {
      id,
    },
    data,
  });
}
