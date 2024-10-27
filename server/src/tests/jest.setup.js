const { PrismaClient } = require("@prisma/client");
const testPrisma = new PrismaClient();

beforeAll(async () => {
    await testPrisma.$connect();
});

afterAll(async () => {
    await testPrisma.$disconnect();
    // Optionally, drop the test data if needed
    await testPrisma.user.deleteMany();
    await testPrisma.image.deleteMany();
    await testPrisma.mapData.deleteMany();
});

module.exports = testPrisma;
