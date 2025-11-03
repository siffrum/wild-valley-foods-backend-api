import { DataTypes } from "sequelize";

const createOrderRecordModel = (sequelize) => {
  const OrderRecord = sequelize.define(
    "OrderRecord",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Orders", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Products", key: "id" },
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
      timestamps: true,
      createdAt: "createdOnUTC",
      updatedAt: "lastModifiedOnUTC",
      tableName: "OrderRecords",
    }
  );
  return OrderRecord;
};

export default createOrderRecordModel;
