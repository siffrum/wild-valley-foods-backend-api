import { BOOLEAN, DataTypes } from 'sequelize';

const createProductModel = (sequelize) => {
  const Category = sequelize.models.Category;

  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    richDescription: { type: DataTypes.TEXT, allowNull: true },
    itemId: { type: DataTypes.STRING, allowNull: true }, // our SKU/ID
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    weight: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    currency: { type: DataTypes.STRING, allowNull: true, defaultValue: "INR" },
    isBestSelling:{type:DataTypes.BOOLEAN,allowNull:false,defaultValue:false},
    // 🔹 Razorpay-specific
    razorpayItemId: { type: DataTypes.STRING, allowNull: true },
    hsnCode: { type: DataTypes.STRING, allowNull: true },
    taxRate: { type: DataTypes.INTEGER, allowNull: true },
    unit: { type: DataTypes.STRING, allowNull: true },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Categories', key: 'id' },
      onDelete: 'CASCADE',
    },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
    lastModifiedBy: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    timestamps: true,
    createdAt: 'createdOnUTC',
    updatedAt: 'lastModifiedOnUTC',
    indexes: [{ fields: ['sku'] }, { fields: ['categoryId'] }],
  });

  // Associations
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category', onDelete: 'CASCADE' });
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products', onDelete: 'CASCADE' });

  return Product;
};

export default createProductModel;
