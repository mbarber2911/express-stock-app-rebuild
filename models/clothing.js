module.exports = (sequelize, DataTypes) => {
    const Clothing = sequelize.define('Clothing', {
      size: { type: DataTypes.STRING },
      material: { type: DataTypes.STRING },
      color: { type: DataTypes.STRING },
      brand: { type: DataTypes.STRING },
      gender: { type: DataTypes.STRING }
    });
  
    Clothing.associate = (models) => {
      Clothing.belongsTo(models.Product);
    };
  
    return Clothing;
};