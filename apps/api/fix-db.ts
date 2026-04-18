import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.$executeRawUnsafe(`UPDATE jobs SET benefits = '[]' WHERE benefits IS NOT NULL AND JSON_VALID(benefits) = 0`);
    console.log('Fixed invalid JSON in benefits column');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
