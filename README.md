# Stock Control System

A full-stack web application for managing product inventory, built with Node.js, Express, Sequelize ORM, and SQLite. Supports three product categories (Clothing, Electronics, Books) with full CRUD operations, advanced sorting and searching, currency conversion, and a stock summary dashboard.

---

## Features

### 1. Full CRUD Operations
All four core database operations are implemented for products:
- **Create** — Add new products via a dynamic form that conditionally renders fields based on product type
- **Read** — View all products on the inventory page, or view full details for individual products
- **Update** — Edit any product's core fields as well as its type-specific fields (size/material, brand/warranty, author/genre/ISBN)
- **Delete** — Remove products from the inventory with a single click

### 2. Three Product Categories
The application supports three distinct product types, each with their own associated database table and fields:
- **Clothing** — size, material
- **Electronic** — brand, warranty
- **Book** — author, genre, ISBN

Each category has its own colour-coded badge in the UI and conditionally rendered form fields on both the create and edit pages.

### 3. Advanced Sorting and Searching
- **Search** — Filter products by name using partial string matching (`LIKE` operator)
- **Sort** — Sort the product list by name, price, or quantity in either ascending or descending order
- Sort inputs are validated server-side against a whitelist of allowed column names and directions, preventing SQL injection via query parameters

### 4. Multi-Currency Conversion
On the product details page, users can convert the GBP price into any of the following currencies using the live [ExchangeRate API](https://www.exchangerate-api.com/):
- USD — US Dollar
- EUR — Euro
- JPY — Japanese Yen
- CAD — Canadian Dollar
- AUD — Australian Dollar
- GBP — British Pound (no conversion)

### 5. Stock Summary Dashboard
A dedicated summary page (`/summary`) displays:
- Total number of products
- Total stock units across all products
- Total stock value (price × quantity, summed)
- Breakdown of product count by category
- Low stock alert table (products with fewer than 30 units)
- Full stock list with individual stock values per product

### 6. Dark Mode Frontend
A fully custom dark mode UI built with plain CSS, featuring:
- Responsive card-based layout
- Stats grid on the summary page
- Colour-coded category badges
- Low stock quantity highlighting in red
- Consistent navigation bar across all pages
- Smooth hover transitions on buttons and table rows

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Sequelize |
| Database | SQLite |
| Templating | Pug |
| HTTP Client | Axios |
| Testing | Jest + Supertest |
| Dev Server | Nodemon |
| Method Override | method-override |

---

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Steps

1. Clone the repository:
```bash
git clone <your-repo-url>
cd express-stock-app-rebuild
```

2. Install dependencies:
```bash
npm install
```

3. Build the database with sample data:
```bash
npm run database:prebuild
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser at:
```
http://localhost:3000
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Nodemon (auto-restarts on file changes) |
| `npm start` | Start production server |
| `npm test` | Run the full Jest test suite |
| `npm run database:prebuild` | Drop and rebuild the SQLite database with sample data |

---

## Database Schema

The application uses a relational specialisation pattern — a base `Products` table stores common fields, with separate child tables for each product type linked via a one-to-one relationship.
```
Products
├── id (PRIMARY KEY, STRING)
├── name (STRING, NOT NULL)
├── price (FLOAT, NOT NULL)
├── quantity (INTEGER, NOT NULL)
└── type (STRING, NOT NULL)

Clothings
├── id (AUTO, PRIMARY KEY)
├── ProductId (FOREIGN KEY → Products.id)
├── size (STRING)
└── material (STRING)

Electronics
├── id (AUTO, PRIMARY KEY)
├── ProductId (FOREIGN KEY → Products.id)
├── brand (STRING)
├── warranty (STRING)
├── model (STRING)
├── powerConsumption (FLOAT)
└── dimensions (STRING)

Books
├── id (AUTO, PRIMARY KEY)
├── ProductId (FOREIGN KEY → Products.id)
├── author (STRING)
├── genre (STRING)
└── isbn (STRING)
```

---

## Testing

The test suite uses **Jest** for unit testing and **Supertest** for integration testing. Run all tests with:
```bash
npm test
```

### Test Results
**28 tests passing** across three test categories:

### Unit Tests
Test controller functions in isolation by mocking request and response objects:
- Create clothing, electronic, and book products
- Delete a product
- Delete a non-existent product (404 handling)
- Get product details
- Get details for non-existent product (404 handling)
- Get summary page with correct totals

### Integration Tests
Test the full HTTP request/response cycle using Supertest:
- Index page loads correctly
- Create a product and verify it appears on the index page
- Search returns matching products
- Search returns no results for unknown query
- Sort by price ascending/descending
- Sort by quantity
- Details page loads for existing product
- Details page returns 404 for non-existent product
- Edit page loads with pre-filled data
- Update a product and verify changes persist
- Delete a product via HTTP and verify removal
- Summary page loads with correct structure

### Edge Case Tests
Validate error handling and security:
- Create with missing required fields returns 500
- Create with invalid product type returns 400
- Create with duplicate product ID returns 500
- Sort with SQL injection attempt falls back safely
- Sort with invalid order direction falls back safely
- Search with empty query returns all products
- Edit non-existent product returns 404

---

## Programming Standards

The following standards were applied consistently throughout the codebase:

- **Naming conventions** — camelCase for variables and functions, PascalCase for models and classes
- **DRY principles** — shared includes array for Sequelize model associations reused across controller functions, avoiding repetition
- **Pure functions** — each controller function handles a single operation with no side effects
- **Narrow scoping** — variables declared with `const` and `let` at the smallest possible scope
- **No deep nesting** — controller logic kept flat using early returns for error/not-found cases
- **Input validation** — sort column and direction validated against a whitelist before being passed to Sequelize, preventing injection attacks
- **Meaningful comments** — inline comments explain non-obvious logic without duplicating what the code already says
- **Consistent formatting** — 2-space indentation throughout, one instruction per line
- **Error handling** — all async controller functions wrapped in try/catch with appropriate HTTP status codes

---

## Known Issues and Future Improvements

- **Currency conversion** relies on a free external API which has rate limits — a caching layer could be added to reduce API calls
- **Product IDs** are manually entered strings — a future improvement would be auto-generating IDs based on product type prefix
- **Search** currently only matches product names — could be extended to search by category-specific fields (e.g. author for books)
- **Authentication** — the application has no user authentication, which would be required for a production environment
- **Pagination** — the product list loads all records at once, which would not scale for large datasets
