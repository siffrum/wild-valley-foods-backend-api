import { DataTypes } from "sequelize";

const createTestimonialModel = (sequelize) => {
  const Testimonial = sequelize.define(
    "Testimonial",
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
        validate: { isEmail: true },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 },
      },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
      lastModifiedBy: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      timestamps: true,
      createdAt: "createdOnUTC",
      updatedAt: "lastModifiedOnUTC",
    }
  );

  return Testimonial;
};

export default createTestimonialModel;
