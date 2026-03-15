const db = require("../models");
const Product = db.Product;
const Clothing = db.Clothing;
const Electronic = db.Electronic;
const Book = db.Book;
const axios = require("axios");
const { Op } = require("sequelize");

// Reusable include array for fetching associated subtype models
const PRODUCT_INCLUDE = [
  { model: Clothing, required: false },
  { model: Electronic, required: false },
  { model: Book, required: false },
];

exports.index = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.render("index", { products: products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products.");
  }
};

exports.getDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { include: PRODUCT_INCLUDE });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    res.render("details", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching product details.");
  }
};

exports.search = async (req, res) => {
  try {
    const { query } = req.query;

    // Use Op.like for partial name matching
    const products = await Product.findAll({
      where: {
        name: { [Op.like]: `%${query}%` },
      },
    });

    res.render("index", { products, searchQuery: query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error searching products.");
  }
};

exports.sort = async (req, res) => {
  try {
    const { sortBy = "name", order = "ASC" } = req.query;

    // Whitelist valid columns and directions to prevent injection
    const validColumns = ["name", "price", "quantity"];
    const validOrders = ["ASC", "DESC"];

    const column = validColumns.includes(sortBy) ? sortBy : "name";
    const direction = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : "ASC";

    const products = await Product.findAll({
      order: [[column, direction]],
    });

    res.render("index", { products, sortBy: column, order: direction });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sorting products.");
  }
};

exports.create = async (req, res) => {
  try {
    const { id, name, price, quantity, type, size, material, brand, warranty, author, genre, isbn } = req.body;

    // Create the base product record
    const product = await Product.create({ id, name, price, quantity, type });

    // Create the associated subtype record based on product type
    if (type === "clothing") {
      await Clothing.create({ ProductId: product.id, size, material });
    } else if (type === "electronic") {
      await Electronic.create({ ProductId: product.id, brand, warranty });
    } else if (type === "book") {
      await Book.create({ ProductId: product.id, author, genre, isbn });
    } else {
      return res.status(400).send("Invalid product type.");
    }

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating product.");
  }
};

exports.convertCurrency = async (req, res) => {
  const { id } = req.params;
  const targetCurrency = req.query.currency || "USD"; // Default to USD if no currency specified

  try {
    const product = await Product.findByPk(id, { include: PRODUCT_INCLUDE });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/GBP`);
    const exchangeRate = response.data.rates[targetCurrency];

    // No conversion needed if target is already GBP
    const convertedPrice = targetCurrency === "GBP"
      ? product.price
      : (product.price * exchangeRate).toFixed(2);

    res.render("details", {
      product,
      convertedPrice,
      targetCurrency,
      originalCurrency: "GBP",
    });
  } catch (error) {
    console.error("Error fetching exchange rates or product:", error);
    res.status(500).send("Error converting currency.");
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    await product.destroy();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product.");
  }
};

exports.getEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { include: PRODUCT_INCLUDE });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    res.render("edit", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching product for edit.");
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, size, material, brand, warranty, author, genre, isbn } = req.body;

    const product = await Product.findByPk(id, { include: PRODUCT_INCLUDE });

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    // Update base product fields
    await product.update({ name, price, quantity });

    // Update subtype-specific fields
    if (product.type === "clothing" && product.Clothing) {
      await product.Clothing.update({ size, material });
    } else if (product.type === "electronic" && product.Electronic) {
      await product.Electronic.update({ brand, warranty });
    } else if (product.type === "book" && product.Book) {
      await product.Book.update({ author, genre, isbn });
    }

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating product.");
  }
};

exports.getSummary = async (req, res) => {
  try {
    const products = await Product.findAll({ include: PRODUCT_INCLUDE });

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2);
    const lowStock = products.filter(p => p.quantity < 30);

    const byCategory = {
      clothing: products.filter(p => p.type === "clothing").length,
      electronic: products.filter(p => p.type === "electronic").length,
      book: products.filter(p => p.type === "book").length,
    };

    res.render("summary", { totalProducts, totalValue, totalStock, lowStock, byCategory, products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching stock summary.");
  }
};