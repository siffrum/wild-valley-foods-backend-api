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
import userDetailModel from "../model/userDetail.model.js";        // ✅ new
import userAddressModel from "../model/userAddress.model.js";
import createProductPaymentModel from "../model/productPayment.model.js"; // ✅ new

// Variables
let User = null;
let License = null;
let Module = null;
let Banner = null;
let categories = null;
let Product = null;
let Image = null;
let UserDetail = null;        // ✅ new
let ProductPayment = null;    // ✅ new
let UserAddress = null;

// Local DB connection
// export const dbConnection = async (database, username, password) => {
//   const sequelize = new Sequelize(database, username, password, {
//     host: "localhost",
//     dialect: "postgres",
//   });

  // Production DB connection (commented)
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

    // Initialize models
    User = await createUserModel(sequelize);
    License = await createLicenseModel(sequelize);
    Module = await createModuleModel(sequelize);
    Banner = await createBannerModel(sequelize);
    categories = await createCategoryModel(sequelize);
    Product = await createProductModel(sequelize);
    Image = await createImageModel(sequelize);
    UserDetail = await userDetailModel(sequelize);               // ✅ new
    ProductPayment = await createProductPaymentModel(sequelize); // ✅ new
    UserAddress = await userAddressModel(sequelize);
    // Sync database
    await sequelize.sync({ alter: true });

    console.log("✅ Connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
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
  UserDetail,       // ✅ export
  ProductPayment,   // ✅ export
  UserAddress,
};
