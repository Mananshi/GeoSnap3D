const mongoose = require("mongoose");

beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    // Clean up and disconnect from the database
    await mongoose.connection.close();
});

describe("Database Connection", () => {
    it("should connect to the database", async () => {
        const connectionState = mongoose.connection.readyState;
        expect(connectionState).toBe(1); // 1 means connected
    });
});
