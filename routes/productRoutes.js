const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.get("/", stockController.index);

router.get("/details/:id", stockController.getDetails);

// GET search products
router.get('/search', stockController.search);

// GET sort products
router.get('/sort', stockController.sort);

// POST create a new product
router.post('/create', stockController.create);
router.get('/details/:id/convert', stockController.convertCurrency);

module.exports = router;
