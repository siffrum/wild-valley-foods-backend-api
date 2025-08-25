// model/refund.model.js
import { DataTypes } from "sequelize";

const refundModel = (sequelize) => {
  const Refund = sequelize.define(
    "Refund",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      razorpayRefundId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      productPaymentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ProductPayment", // ✅ must match model name
          key: "id",
        },
        onDelete: "CASCADE",
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Product", // ✅ must match model name
          key: "id",
        },
      },
      userDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserDetail", // ✅ must match model name
          key: "id",
        },
      },
      refundAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      refundStatus: {
        type: DataTypes.ENUM("Initiated", "Processed", "Failed"),
        allowNull: false,
        defaultValue: "Initiated",
      },
      refundDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      refundReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      tableName: "Refunds",
    }
  );

  return Refund;
};

// Refund associations
ProductPayment.hasMany(Refund, { foreignKey: "productPaymentId", as: "refunds" });
Refund.belongsTo(ProductPayment, { foreignKey: "productPaymentId", as: "payment" });

Product.hasMany(Refund, { foreignKey: "productId", as: "refunds" });
Refund.belongsTo(Product, { foreignKey: "productId", as: "product" });

UserDetail.hasMany(Refund, { foreignKey: "userDetailId", as: "refunds" });
Refund.belongsTo(UserDetail, { foreignKey: "userDetailId", as: "user" });

export default refundModel;
