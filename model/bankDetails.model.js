// model/bankDetails.model.js
import { DataTypes } from "sequelize";

const bankDetailsModel = (sequelize) => {
  const CustomerDetail = sequelize.models.CustomerDetail;

  const BankDetails = sequelize.define(
    "BankDetails",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customerDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CustomerDetails",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      accountHolderName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ifscCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branchName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "BankDetails",
    }
  );

  // ✅ Associations
  if (CustomerDetail) {
    CustomerDetail.hasMany(BankDetails, {
      foreignKey: "customerDetailId",
      as: "bankAccounts",
    });
    BankDetails.belongsTo(CustomerDetail, {
      foreignKey: "customerDetailId",
      as: "customer",
    });
  }

  return BankDetails;
};

export default bankDetailsModel;
