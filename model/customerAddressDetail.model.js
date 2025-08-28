import { DataTypes } from "sequelize";

const customerAddressDetailModel = (sequelize) => {
  const CustomerDetail = sequelize.models.CustomerDetail; // ✅ get CustomerDetail model

  const CustomerAddressDetail = sequelize.define(
    "CustomerAddressDetail",
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
          model: "CustomerDetails", // must match table name
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
      tableName: "CustomerAddressDetails",
    }
  );

  // ✅ Associations
  if (CustomerDetail) {
    CustomerDetail.hasMany(CustomerAddressDetail, {
      foreignKey: "customerDetailId",
      as: "addresses",
    });

    CustomerAddressDetail.belongsTo(CustomerDetail, {
      foreignKey: "customerDetailId",
      as: "customer",
    });
  }

  return CustomerAddressDetail;
};

export default customerAddressDetailModel;
