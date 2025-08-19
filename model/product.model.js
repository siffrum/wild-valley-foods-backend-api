import { DataTypes } from 'sequelize';

const createProductModel = (sequelize) => {
  const Category = sequelize.models.Category;

  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    shippingOptions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    paymentOptions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lastModifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    timestamps: true,
    createdAt: 'createdOnUTC',
    updatedAt: 'lastModifiedOnUTC',
    indexes: [
      { fields: ['sku'] },
      { fields: ['categoryId'] },
    ],
  });

  // Associations
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

  return Product;
};
export default createProductModel;
