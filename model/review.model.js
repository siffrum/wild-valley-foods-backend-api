import { DataTypes } from "sequelize";

const createReviewModel = (sequelize) => {
  const Product = sequelize.models.Product;

  const Review = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false, // customer/admin name
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false, // customer/admin email
        validate: { isEmail: true },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }, // 1 to 5 stars
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false, // customer/admin comment
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Products", key: "id" },
        onDelete: "CASCADE",
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true, // optional for admin
      },
      lastModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      createdAt: "createdOnUTC",
      updatedAt: "lastModifiedOnUTC",
    }
  );

  // Associations
  Review.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
    onDelete: "CASCADE",
  });
  Product.hasMany(Review, {
    foreignKey: "productId",
    as: "reviews",
    onDelete: "CASCADE",
  });

  return Review;
};

export default createReviewModel;
