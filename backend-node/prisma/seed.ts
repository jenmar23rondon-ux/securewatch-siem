import bcrypt from "bcryptjs";
import { PrismaClient, LogSourceType, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@securewatch.local" },
    update: {},
    create: {
      name: "SecureWatch Admin",
      email: "admin@securewatch.local",
      password,
      role: Role.ADMIN
    }
  });

  const sources = [
    ["API Gateway", LogSourceType.API_GATEWAY],
    ["Linux Server", LogSourceType.LINUX_SERVER],
    ["Auth Service", LogSourceType.AUTH_SERVICE],
    ["Firewall", LogSourceType.FIREWALL],
    ["Database", LogSourceType.DATABASE]
  ] as const;

  for (const [name, type] of sources) {
    const existing = await prisma.logSource.findFirst({ where: { name } });
    if (!existing) {
      await prisma.logSource.create({
        data: { name, type, description: `${name} simulated source` }
      });
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
