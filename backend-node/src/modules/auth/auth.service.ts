import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { signToken } from "../../utils/jwt";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}) {
  const password = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password,
      role: data.role || Role.VIEWER
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return {
    user: safeUser,
    token: signToken({ id: user.id, email: user.email, role: user.role })
  };
}
