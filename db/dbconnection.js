import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Models
import createUserModel from "../model/userModel.js";
import createLicenseModel from "../model/licences.model.js";
import createModuleModel from "../model/module.model.js";
import createBannerModel from "../model/banner.model.js";
import createCategoryModel from "../model/category.model.js";
import createProductModel from "../model/product.model.js";
import createImageModel from "../model/image.model.js";
import customerAddressDetailModel from "../model/customerAddressDetail.model.js";
import createProductPaymentModel from "../model/productpayment.model.js";
import customerDetailModel from "../model/customerDetail.model.js";
import ContactUsModel from "../model/contactUs.model.js";
import createReviewModel from "../model/review.model.js";
import createTestimonialModel from "../model/testmonials.model.js";
import createVideoModel from "../model/video.model.js";
import createOrderModel from "../model/order.model.js";
import createOrderRecordModel from "../model/orderRecord.model.js";
//import refundModel from "../model/refund.model.js";

// Variables
let User = null;
let License = null;
let Module = null;
let Banner = null;
let categories = null;
let Product = null;
let Image = null;
let CustomerDetail = null;
let CustomerAddressDetail = null;
let ProductPayment = null;
let ContactUs = null;
let Review = null;
let Testimonial = null;
let Video = null;
let Order = null;
let OrderRecord = null;
let Refund = null;

// DB Connection
// export const dbConnection = async (database, username, password) => {
//   const sequelize = new Sequelize(database, username, password, {
//     host: "localhost",
//     dialect: "postgres",
//   });
//  Production DB connection (commented)
  export const dbConnection = async () => {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      protocol: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required for Railway PostgreSQL SSL
        },
      },
    });
  try {
    await sequelize.authenticate();
    console.log("✅ DB Authenticated");

    // Initialize models
    User = await createUserModel(sequelize);
    License = await createLicenseModel(sequelize);
    Module = await createModuleModel(sequelize);
    Banner = await createBannerModel(sequelize);
    categories = await createCategoryModel(sequelize);
    Product = await createProductModel(sequelize);
    Image = await createImageModel(sequelize);
    CustomerDetail = await customerDetailModel(sequelize);
    CustomerAddressDetail = await customerAddressDetailModel(sequelize);
    ProductPayment = await createProductPaymentModel(sequelize);
    ContactUs = await ContactUsModel(sequelize);
    Review = await createReviewModel(sequelize);
    Testimonial = await createTestimonialModel(sequelize);
    Video = await createVideoModel(sequelize);
    Order = await createOrderModel(sequelize);
    OrderRecord = await createOrderRecordModel(sequelize);
    //Refund = await refundModel(sequelize); 

    // Associations
    Order.hasMany(OrderRecord, { foreignKey: "orderId", as: "items" });
    OrderRecord.belongsTo(Order, { foreignKey: "orderId", as: "order" });

    CustomerDetail.hasMany(CustomerAddressDetail, {
      foreignKey: "customerDetailId",
      as: "addresses",
    });
    CustomerAddressDetail.belongsTo(CustomerDetail, {
      foreignKey: "customerDetailId",
      as: "customer",
    });
//Check this
    

    // Database Sync
    await sequelize.sync({ alter: true });
    console.log("✅ Connection has been established successfully.");

    return {
      sequelize,
      models: {
        User,
        License,
        Module,
        Banner,
        categories,
        Product,
        Image,
        CustomerDetail,
        CustomerAddressDetail,
        ProductPayment,
        ContactUs,
        Review,
        Testimonial,
        Video,
        Order,
        OrderRecord,
        //Refund
      },
    };
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
};

// Export models
export {
  User,
  License,
  Module,
  Banner,
  categories,
  Image,
  Product,
  CustomerDetail,
  CustomerAddressDetail,
  ProductPayment,
  ContactUs,
  Review,
  Testimonial,
  Video,
  Order,
  OrderRecord,
  //Refund
};
