import { DataTypes } from 'sequelize';

const createProductPaymentModel = (sequelize) => {
  // FIX: use correct model name
  const UserDetail = sequelize.models.UserDetail;

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
      userDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserDetails", // ✅ still fine (table name, not model)
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
        { fields: ['userDetailId'] },
        { fields: ['razorpayOrderId'] },
      ],
    }
  );

  // ✅ Associations
  if (UserDetail) {
    ProductPayment.belongsTo(UserDetail, {
      foreignKey: 'userDetailId',
      as: 'userDetails',
    });

    UserDetail.hasMany(ProductPayment, {
      foreignKey: 'userDetailId',
      as: 'payments',
    });
  }

  return ProductPayment;
};

export default createProductPaymentModel;
