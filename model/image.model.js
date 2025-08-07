import { DataTypes } from 'sequelize';

const createImageModel = (sequelize) => {
  const Product = sequelize.models.Product;

  const Image = sequelize.define('Image', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    timestamps: true,
    createdAt: 'createdOnUTC',
    updatedAt: 'lastModifiedOnUTC',
  });

  // Associations
  Image.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  Product.hasMany(Image, { foreignKey: 'productId', as: 'images' });

  return Image;
};

export default createImageModel;
