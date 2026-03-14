module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define('Book', {
      author: { type: DataTypes.STRING },
      genre: { type: DataTypes.STRING },
      isbn: { type: DataTypes.STRING }
    });

    Book.associate = (models) => {
      Book.belongsTo(models.Product);
    };

    return Book;
};