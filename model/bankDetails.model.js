// model/bankDetails.model.js
import { DataTypes } from "sequelize";

const bankDetailsModel = (sequelize) => {
  const UserDetail = sequelize.models.UserDetail;

  const BankDetails = sequelize.define(
    "BankDetails",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserDetails",
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
  if (UserDetail) {
    UserDetail.hasMany(BankDetails, {
      foreignKey: "userDetailId",
      as: "bankAccounts",
    });
    BankDetails.belongsTo(UserDetail, {
      foreignKey: "userDetailId",
      as: "user",
    });
  }

  return BankDetails;
};

export default bankDetailsModel;
