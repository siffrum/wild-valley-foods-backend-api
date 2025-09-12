import { DataTypes } from "sequelize";

const ContactUsModel = (sequelize) => {
  const ContactUs = sequelize.define(
    "ContactUs",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true, // ✅ Ensures proper email format
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lastModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "ContactUs", // ✅ Explicit table name
      timestamps: true,
      createdAt: "createdOnUTC",
      updatedAt: "lastModifiedOnUTC",
    }
  );

  return ContactUs;
};

export default ContactUsModel;
