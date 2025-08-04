import { DataTypes } from "sequelize";

const createLicenseModel = (sequelize) => {
  const License = sequelize.define("License", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    validity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Validity period in days",
    },
    role: {
      type: DataTypes.ENUM("VendorLicense", "ResearcherLicense"),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lastModifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    timestamps: true,
    createdAt: 'createdOnUTC',
    updatedAt: 'lastModifiedOnUTC',
    indexes: [{ fields: ["name"] }, { fields: ["role"] }],
  });

  return License;
};

export default createLicenseModel;
