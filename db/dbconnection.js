import { Sequelize } from "sequelize";
import createUserModel from "../model/userModel.js";
import createLicenseModel from "../model/licences.model.js";
import createModuleModel from "../model/module.model.js";
import createBannerModel from "../model/banner.model.js";
import createCategoryModel from "../model/category.model.js";
import createProductModel from "../model/product.model.js";
import createImageModel from "../model/image.model.js";
let User = null;
let License = null;
let Module = null;
let Banner = null;
let categories = null;
let Product = null;
let Image = null;
export const dbConnection = async (database, username, password) => {
  const sequelize = new Sequelize(database, username, password, {
    host: "localhost",
    dialect: "postgres",
  });
  try {
    await sequelize.authenticate();
    User = await createUserModel(sequelize);
    License= await createLicenseModel(sequelize);
    Module= await createModuleModel(sequelize);
    Banner = await createBannerModel(sequelize);
    categories = await createCategoryModel(sequelize);
    Product = await createProductModel(sequelize);
    Image = await createImageModel(sequelize);
    await sequelize.sync({alter:true});
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export {User,License,Module,Banner,categories,Image,Product};
