import { DataTypes } from 'sequelize';

const createCategoryModel = (sequelize) => {
  const Category = sequelize.define(
    'Category',
    {
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
      category_icon: {
        type: DataTypes.STRING, // stores file path as string
        allowNull: true,
      },
      slider: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lastModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      createdAt: 'createdOnUTC',
      updatedAt: 'lastModifiedOnUTC',
      indexes: [
        { fields: ['name'] },
        { fields: ['status'] },
      ],
    }
  );

  return Category;
};

export default createCategoryModel;
