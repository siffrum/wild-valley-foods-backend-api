import { DataTypes } from "sequelize";

const userAddressModel = (sequelize) => {
  const UserDetail = sequelize.models.UserDetail; // ✅ get UserDetail model

  const UserAddress = sequelize.define(
    "UserAddress",
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
          model: "UserDetails", // must match table name
          key: "id",
        },
        onDelete: "CASCADE", // ✅ delete addresses if user deleted
      },
      addressLine1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      addressLine2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      addressType: {
        type: DataTypes.ENUM("Home", "Work", "Other"),
        allowNull: false,
        defaultValue: "Home",
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
      tableName: "UserAddresses",
    }
  );

  // ✅ Associations
  if (UserDetail) {
    UserDetail.hasMany(UserAddress, {
      foreignKey: "userDetailId",
      as: "addresses",
    });

    UserAddress.belongsTo(UserDetail, {
      foreignKey: "userDetailId",
      as: "user",
    });
  }

  return UserAddress;
};

export default userAddressModel;
