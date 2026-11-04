import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  // Read arguments from command line: npx tsx scripts/create-admin.ts <email> <password> [name]
  const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@company.com";
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || "password123";
  const name = process.argv[4] || "System Administrator";

  console.log(`\n--- Provisioning Administrator ---`);
  console.log(`Checking if account exists for: ${email}...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.role === Role.ADMIN) {
      console.log(`Notice: An administrator account with email ${email} already exists.`);
      return;
    }

    console.log(`User ${email} found with role '${existingUser.role}'. Promoting to 'ADMIN'...`);
    await prisma.user.update({
      where: { email },
      data: {
        role: Role.ADMIN,
        department: null, // Global admin is not confined to one department
      },
    });
    console.log(`Success: User ${email} has been promoted to ADMIN.`);
    return;
  }

  console.log(`Hashing password securely with bcrypt...`);
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      department: null, // Global admin
    },
  });

  console.log(`Success: Created new ADMIN account!`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role:  ${admin.role}`);
  console.log(`---------------------------------\n`);
}

createAdmin()
  .catch((error) => {
    console.error("Error creating administrator:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
