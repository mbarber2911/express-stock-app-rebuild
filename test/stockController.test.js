const stockController = require("../controllers/stockController");
const db = require("../models");
const request = require("supertest");
const app = require("../app");

// Sync a fresh database before all tests run
beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

// Close database connection after all tests complete
afterAll(async () => {
  await db.sequelize.close();
});

describe("Stock Controller", () => {

  // ── Unit Tests ──────────────────────────────────────────────────
  describe("Unit Tests", () => {

    test("Create a new clothing product", async () => {
      const mockReq = {
        body: {
          id: "TEST001",
          name: "Test Shirt",
          price: 9.99,
          quantity: 100,
          type: "clothing",
          size: "M",
          material: "Cotton",
        },
      };
      const mockRes = { redirect: jest.fn() };

      await stockController.create(mockReq, mockRes);

      const product = await db.Product.findByPk("TEST001");
      expect(product).not.toBeNull();
      expect(product.name).toBe("Test Shirt");
      expect(product.type).toBe("clothing");
      expect(mockRes.redirect).toHaveBeenCalledWith("/");

      // Verify clothing record was created
      const clothing = await db.Clothing.findOne({ where: { ProductId: "TEST001" } });
      expect(clothing).not.toBeNull();
      expect(clothing.size).toBe("M");
      expect(clothing.material).toBe("Cotton");
    });

    test("Create a new electronic product", async () => {
      const mockReq = {
        body: {
          id: "TEST002",
          name: "Test Phone",
          price: 599.99,
          quantity: 20,
          type: "electronic",
          brand: "TechCo",
          warranty: "1 year",
        },
      };
      const mockRes = { redirect: jest.fn() };

      await stockController.create(mockReq, mockRes);

      const product = await db.Product.findByPk("TEST002");
      expect(product).not.toBeNull();
      expect(product.type).toBe("electronic");
      expect(mockRes.redirect).toHaveBeenCalledWith("/");

      // Verify electronic record was created
      const electronic = await db.Electronic.findOne({ where: { ProductId: "TEST002" } });
      expect(electronic).not.toBeNull();
      expect(electronic.brand).toBe("TechCo");
      expect(electronic.warranty).toBe("1 year");
    });

    test("Create a new book product", async () => {
      const mockReq = {
        body: {
          id: "TEST003",
          name: "Test Book",
          price: 12.99,
          quantity: 40,
          type: "book",
          author: "Test Author",
          genre: "Fiction",
          isbn: "978-0000000000",
        },
      };
      const mockRes = { redirect: jest.fn() };

      await stockController.create(mockReq, mockRes);

      const product = await db.Product.findByPk("TEST003");
      expect(product).not.toBeNull();
      expect(product.type).toBe("book");
      expect(mockRes.redirect).toHaveBeenCalledWith("/");

      // Verify book record was created
      const book = await db.Book.findOne({ where: { ProductId: "TEST003" } });
      expect(book).not.toBeNull();
      expect(book.author).toBe("Test Author");
      expect(book.genre).toBe("Fiction");
    });

    test("Delete a product", async () => {
      // First create a product to delete
      const mockReq = {
        body: {
          id: "TEST004",
          name: "Product To Delete",
          price: 5.99,
          quantity: 10,
          type: "clothing",
          size: "S",
          material: "Polyester",
        },
      };
      const mockRes = { redirect: jest.fn() };
      await stockController.create(mockReq, mockRes);

      // Now delete it
      const deleteReq = { params: { id: "TEST004" } };
      const deleteRes = { redirect: jest.fn() };
      await stockController.delete(deleteReq, deleteRes);

      const product = await db.Product.findByPk("TEST004");
      expect(product).toBeNull();
      expect(deleteRes.redirect).toHaveBeenCalledWith("/");
    });

    test("Delete a product that does not exist returns 404", async () => {
      const mockReq = { params: { id: "NONEXISTENT" } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await stockController.delete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith("Product not found.");
    });

    test("Get product details returns correct product", async () => {
      const mockReq = { params: { id: "TEST001" } };
      const mockRes = {
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await stockController.getDetails(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        "details",
        expect.objectContaining({
          product: expect.objectContaining({ id: "TEST001" }),
        })
      );
    });

    test("Get details for non-existent product returns 404", async () => {
      const mockReq = { params: { id: "DOESNOTEXIST" } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        render: jest.fn(),
      };

      await stockController.getDetails(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("Get summary returns correct totals", async () => {
      const mockReq = {};
      const mockRes = { render: jest.fn() };

      await stockController.getSummary(mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        "summary",
        expect.objectContaining({
          totalProducts: expect.any(Number),
          totalValue: expect.any(String),
          totalStock: expect.any(Number),
          byCategory: expect.objectContaining({
            clothing: expect.any(Number),
            electronic: expect.any(Number),
            book: expect.any(Number),
          }),
        })
      );
    });

  });

  // ── Integration Tests ───────────────────────────────────────────
  describe("Integration Tests", () => {

    test("Index page loads and shows products", async () => {
      const response = await request(app).get("/").expect(200);
      expect(response.text).toContain("Stock Inventory");
    });

    test("Create a product and retrieve it on index page", async () => {
      const newProduct = {
        id: "INT001",
        name: "Integration Test Product",
        price: 19.99,
        quantity: 50,
        type: "electronic",
        brand: "IntegrationCo",
        warranty: "2 years",
      };

      await request(app).post("/create").send(newProduct).expect(302);

      const response = await request(app).get("/").expect(200);
      expect(response.text).toContain("Integration Test Product");
    });

    test("Search returns matching products", async () => {
      const response = await request(app)
        .get("/search?query=Integration Test Product")
        .expect(200);

      expect(response.text).toContain("Integration Test Product");
    });

    test("Search returns no results for unknown query", async () => {
      const response = await request(app)
        .get("/search?query=xyznonexistentproduct")
        .expect(200);

      expect(response.text).not.toContain("Test Shirt");
    });

    test("Sort by price ascending returns 200", async () => {
      const response = await request(app)
        .get("/sort?sortBy=price&order=ASC")
        .expect(200);

      expect(response.text).toContain("Stock Inventory");
    });

    test("Sort by price descending returns 200", async () => {
      const response = await request(app)
        .get("/sort?sortBy=price&order=DESC")
        .expect(200);

      expect(response.text).toContain("Stock Inventory");
    });

    test("Sort by quantity returns 200", async () => {
      const response = await request(app)
        .get("/sort?sortBy=quantity&order=ASC")
        .expect(200);

      expect(response.text).toContain("Stock Inventory");
    });

    test("Details page loads for existing product", async () => {
      const response = await request(app)
        .get("/details/TEST001")
        .expect(200);

      expect(response.text).toContain("Test Shirt");
    });

    test("Details page returns 404 for non-existent product", async () => {
      await request(app).get("/details/DOESNOTEXIST").expect(404);
    });

    test("Edit page loads with pre-filled data", async () => {
      const response = await request(app)
        .get("/edit/TEST001")
        .expect(200);

      expect(response.text).toContain("Test Shirt");
    });

    test("Update a product and verify changes", async () => {
      await request(app)
        .put("/edit/TEST001?_method=PUT")
        .send({ name: "Updated Shirt", price: 14.99, quantity: 80, size: "L", material: "Cotton" })
        .expect(302);

      const product = await db.Product.findByPk("TEST001");
      expect(product.name).toBe("Updated Shirt");
      expect(product.price).toBe(14.99);
    });

    test("Delete a product via HTTP and verify removal", async () => {
      // Create a product to delete
      await request(app)
        .post("/create")
        .send({ id: "DEL001", name: "Delete Me", price: 1.99, quantity: 5, type: "book", author: "Nobody", genre: "None", isbn: "000" })
        .expect(302);

      // Delete it
      await request(app)
        .delete("/delete/DEL001?_method=DELETE")
        .expect(302);

      const product = await db.Product.findByPk("DEL001");
      expect(product).toBeNull();
    });

    test("Summary page loads with correct structure", async () => {
      const response = await request(app).get("/summary").expect(200);
      expect(response.text).toContain("Stock Summary");
      expect(response.text).toContain("Total Products");
      expect(response.text).toContain("Low Stock Alert");
    });

  });

  // ── Edge Cases ──────────────────────────────────────────────────
  describe("Edge Cases", () => {

    test("Create a product with missing required fields returns 500", async () => {
      const response = await request(app)
        .post("/create")
        .send({ id: "INVALID001", name: "Invalid Product" })
        .expect(500);

      expect(response.text).toContain("Error creating product");
    });

    test("Create a product with invalid type returns 400", async () => {
      const response = await request(app)
        .post("/create")
        .send({ id: "INVALID002", name: "Bad Type", price: 9.99, quantity: 10, type: "spaceship" })
        .expect(400);

      expect(response.text).toContain("Invalid product type");
    });

    test("Create duplicate product ID returns 500", async () => {
      const response = await request(app)
        .post("/create")
        .send({ id: "TEST001", name: "Duplicate", price: 1.99, quantity: 1, type: "clothing", size: "S", material: "Silk" })
        .expect(500);

      expect(response.text).toContain("Error creating product");
    });

    test("Sort with invalid column falls back safely", async () => {
      const response = await request(app)
        .get("/sort?sortBy=malicious;DROP TABLE Products&order=ASC")
        .expect(200);

      expect(response.text).toContain("Stock Inventory");
    });

    test("Sort with invalid order direction falls back safely", async () => {
      const response = await request(app)
        .get("/sort?sortBy=name&order=INVALID")
        .expect(200);

      expect(response.text).toContain("Stock Inventory");
    });

    test("Search with empty query returns all products", async () => {
      const response = await request(app)
        .get("/search?query=")
        .expect(200);

      expect(response.text).toContain("Stock Inventory");
    });

    test("Edit non-existent product returns 404", async () => {
      await request(app).get("/edit/DOESNOTEXIST").expect(404);
    });

  });

});