const db = require('../models');
const { Product} = db;
const { Clothing } = db;
const { Electronic } = db;
const { Book } = db;

async function prebuildDatabase() {
  try {
    // Sync the database and create tables
    await db.sequelize.sync({ force: true });

    console.log('Database synced. Creating sample data...');

    // Create sample products
    const products = await Product.bulkCreate([
      { id: 'CLO001', name: 'T-Shirt', price: 19.99, quantity: 100, type: 'clothing' },
      { id: 'CLO002', name: 'Jeans', price: 49.99, quantity: 50, type: 'clothing' },
      { id: 'ELE001', name: 'Smartphone', price: 599.99, quantity: 30, type: 'electronic' },
      { id: 'ELE002', name: 'Laptop', price: 999.99, quantity: 20, type: 'electronic' },
      { id: 'BOO001', name: '1984', price: 9.99, quantity: 40, type: 'book' },
      { id: 'BOO002', name: 'The Lord of the Rings', price: 14.99, quantity: 25, type: 'book' },
    ]);

    // Create sample clothing items
    await Clothing.bulkCreate([
      { ProductId: 'CLO001', size: 'M', material: 'Cotton', color: 'White', brand: 'FashionCo', gender: 'Unisex' },
      { ProductId: 'CLO002', size: '32', material: 'Denim', color: 'Blue', brand: 'DenimWear', gender: 'Unisex' },
    ]);

    // Create sample electronics items
    await Electronic.bulkCreate([
      { ProductId: 'ELE001', brand: 'TechGiant', warranty: '1 year', model: 'X2000', powerConsumption: 5, dimensions: '150x75x8mm' },
      { ProductId: 'ELE002', brand: 'LaptopPro', warranty: '2 years', model: 'UltraBook', powerConsumption: 45, dimensions: '350x240x18mm' },
    ]);

    await Book.bulkCreate([
    { ProductId: 'BOO001', author: 'George Orwell', genre: 'Dystopian', isbn: '978-0451524935' },
    { ProductId: 'BOO002', author: 'J.R.R. Tolkien', genre: 'Fantasy', isbn: '978-0261103573' },
    ]);
        
    console.log('Sample data created successfully.');
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await db.sequelize.close();
  }
}
prebuildDatabase();
