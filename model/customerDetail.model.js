import { DataTypes } from 'sequelize';

const customerDetailModel = (sequelize) => {
  const CustomerDetail = sequelize.define(
    'CustomerDetail',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('Admin', 'endUser'),
        allowNull: false,
        defaultValue: 'endUser',
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerId: {
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
      createdAt: 'createdOnUTC',
      updatedAt: 'lastModifiedOnUTC',
      tableName: 'CustomerDetails', // ✅ keeps table name consistent
    }
  );
  return CustomerDetail;
};

export default customerDetailModel;
