import { DataTypes } from 'sequelize';

const createBannerModel = (sequelize) => {
  const Banner = sequelize.define('Banner', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    imageBase64: {
      type: DataTypes.TEXT, // for storing base64 string
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ctaText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
      bannerType: {
      type: DataTypes.ENUM("Slider", "ShortAdd", "LongAdd", "Sales","Voucher"),
      allowNull: false,
      defaultValue: "Slider",
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
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
    indexes: [
      { fields: ['bannerType'] },
    ],
  });

  return Banner;
};

export default createBannerModel;
