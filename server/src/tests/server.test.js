// tests/server.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/server");
const { User, Image, MapData } = require("../src/models");
const jwt = require("jsonwebtoken");

const userData = {
    email: 'testuser@example.com',
    password: 'password123',
};

let authToken;

beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.TEST_DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    // Clean up and disconnect from the database
    await User.deleteMany();
    await Image.deleteMany();
    await MapData.deleteMany();
    await mongoose.connection.close();
});

describe("API Endpoints", () => {
    describe('User Authentication', () => {
        it('should signup a new user', async () => {
            const response = await request(app)
                .post('/signup')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('userId');
        });

        it('should login a user', async () => {
            const response = await request(app)
                .post('/login')
                .send(userData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            authToken = response.body.token; // Save the token for subsequent requests
        });
    });

    describe('Map Data and Image', () => {
        it('should save map data and image for the user', async () => {
            const response = await request(app)
                .post('/save')
                .set('Authorization', `Bearer ${authToken}`)
                .field('northBound', 24.6789)
                .field('southBound', 23.7890)
                .field('eastBound', 54.1234)
                .field('westBound', 53.5678)
                .attach('image', 'uploads/test-image.png'); // Adjust the path as needed

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Map data and image saved successfully');
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post("/save")
                .set('Authorization', `Bearer ${authToken}`)
                .attach("image", 'uploads/test-image.png'); // Only attach image

            expect(response.status).toBe(400);
        });
    });

    describe('Retrieve Maps', () => {
        it('should retrieve all maps for the user', async () => {
            const response = await request(app)
                .get('/maps')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});
