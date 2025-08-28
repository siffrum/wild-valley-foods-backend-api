import { DataTypes } from 'sequelize';

const createProductPaymentModel = (sequelize) => {
  // FIX: use correct model name
  const CustomerDetail = sequelize.models.CustomerDetail;

  const ProductPayment = sequelize.define(
    'ProductPayment',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invoiceId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentLinkId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      canceledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      customerDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CustomerDetails", // ✅ still fine (table name, not model)
          key: "id",
        },
        onDelete: "CASCADE",
      },
      upiPaymentTransactionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankPaymentTransactionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referenceId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      refundId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receipt: {
        type: DataTypes.STRING,
        allowNull: true,
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
        { fields: ['customerDetailId'] },
        { fields: ['razorpayOrderId'] },
      ],
    }
  );

  // ✅ Associations
  if (CustomerDetail) {
    ProductPayment.belongsTo(CustomerDetail, {
      foreignKey: 'customerDetailId',
      as: 'customerDetails',
    });

    CustomerDetail.hasMany(ProductPayment, {
      foreignKey: 'customerDetailId',
      as: 'payments',
    });
  }

  return ProductPayment;
};

export default createProductPaymentModel;
