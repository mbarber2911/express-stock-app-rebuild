const stockController = require("../controllers/stockController");
const db = require("../models");
const request = require("supertest");
const app = require("../app");

// Jest hook to run before all tests
beforeAll(async () => {
  // Sync the database and force true to drop existing tables
  await db.sequelize.sync({ force: true });
});

describe("Stock Controller", () => {
  // Unit Tests
  describe("Unit Tests", () => {
    test("Create a new product", async () => {
      // Mocking the request and response objects
      // This allows us to test the controller function in isolation
      const mockReq = {
        body: {
          id: "TEST001",
          name: "Test Product",
          price: 9.99,
          quantity: 100,
          type: "clothing",
        },
      };
      const mockRes = {
        // Jest mock function to simulate the redirect method
        redirect: jest.fn(),
      };

      // Call the controller method directly
      await stockController.create(mockReq, mockRes);

      // Verify the product was created in the database
      const product = await db.Product.findByPk("TEST001");
      expect(product).not.toBeNull();
      expect(product.name).toBe("Test Product");
      // Check if the mock redirect function was called with the correct argument
      expect(mockRes.redirect).toHaveBeenCalledWith("/");
    });

    // More unit tests...
  });

  // Integration Tests
  describe("Integration Tests", () => {
    test("Create a product and retrieve it", async () => {
      // Using supertest to simulate HTTP requests
      // This tests the entire request-response cycle, including routing
      const newProduct = {
        id: "INT001",
        name: "Integration Test Product",
        price: 19.99,
        quantity: 50,
        type: "electronic",
      };

      await request(app).post("/create").send(newProduct).expect(302); // Expecting a redirect status code

      const response = await request(app).get("/").expect(200);

      // Checking the response body for the created product
      expect(response.text).toContain("Integration Test Product");
    });

    // More integration tests...
  });
});

// Jest hook to run after all tests
afterAll(async () => {
  // Close the database connection
  await db.sequelize.close();
});
