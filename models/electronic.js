module.exports = (sequelize, DataTypes) => {
    const Electronic = sequelize.define('Electronic', {
      brand: { type: DataTypes.STRING },
      warranty: { type: DataTypes.STRING },
      model: { type: DataTypes.STRING },
      powerConsumption: { type: DataTypes.FLOAT },
      dimensions: { type: DataTypes.STRING }
    });
  
    Electronic.associate = (models) => {
      Electronic.belongsTo(models.Product);
    };
  
    return Electronic;
};
