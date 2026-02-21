# Express Stock App

A Node.js Express application for managing product inventory including clothing and electronics.

## 📋 Build Instructions

For detailed step-by-step instructions on how to build this Express application from scratch, please refer to:

**[stock-express-rebuild-instructions.docx](stock-express-rebuild-instructions.docx)**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the database
npm run database:prebuild

# Start the application
npm start

# Or run in development mode with auto-restart
npm run dev

# Run tests
npm test
```

## 📁 Project Structure

```
├── app.js                      # Main application entry point
├── package.json                # Project dependencies and scripts
├── config/
│   └── database.js            # Database configuration
├── controllers/
│   └── stockController.js     # Business logic for stock management
├── models/
│   ├── index.js              # Sequelize initialization
│   ├── product.js            # Base product model
│   ├── clothing.js           # Clothing model
│   └── electronic.js         # Electronic model
├── routes/
│   └── productRoutes.js      # API route definitions
├── views/
│   ├── index.pug             # Homepage view
│   └── details.pug           # Product details view
├── public/
│   └── styles.css            # Stylesheets
├── scripts/
│   └── databasePrebuild.js   # Database setup script
└── test/
    └── stockController.test.js # Controller tests
```

## 🛠 Technologies Used

- **Express.js** - Web framework
- **Sequelize** - ORM for database management
- **SQLite3** - Database
- **Pug** - Template engine
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **Nodemon** - Development auto-reload

## 📖 Documentation

This project was built following the instructions in `stock-express-rebuild-instructions.docx`. Refer to that document for:
- Complete setup guide
- Detailed explanations of each component
- Best practices and conventions
- Troubleshooting tips
