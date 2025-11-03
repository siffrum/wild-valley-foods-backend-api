import router from "../route/auth/auth.routes.js";
import licenseRouter from "../route/License/license.route.js";
import moduleRouter from "../route/License/module.route.js";
import bannerRoute from "../route/websiteResources/banner.route.js";
import category from "../route/product/category.route.js";
import product from "../route/product/product.route.js";
import adminProduct from "../route/product/adminProduct.route.js";
import customer from "../route/customer/customer.route.js";
import contactus from "../route/contact-us/contact-us.route.js";
import webhooks  from "../controller/customer-controller/webhooks.js"; 
import Review  from "../route/product/review.js"
import adminReview from "../route/product/review.admin.js"
import testimonials from "../route/websiteResources/testimonial.route.js";
import video from "../route/websiteResources/video.route.js"; 
import orderRoute from "../route/Order/order.route.js"

/**
 * Registers all routes with base paths
 * @param {Express.Application} app 
 * @param {string} baseUrl 
 */
export const registerRoutes = (app, baseUrl = "") => {
  app.use(`${baseUrl}`, router);
  app.use(`${baseUrl}/license`, licenseRouter);
  app.use(`${baseUrl}/module`, moduleRouter);
  app.use(`${baseUrl}/banner`, bannerRoute);
  app.use(`${baseUrl}`, category);
  app.use(`${baseUrl}/product`, product);
  app.use(`${baseUrl}/admin/product`, adminProduct);
  app.use(`${baseUrl}/customer`, customer);
  app.use(`${baseUrl}/contactus`, contactus);
  app.use(`${baseUrl}/webhooks`, webhooks);
  app.use(`${baseUrl}/review`, Review);
  app.use(`${baseUrl}/AdminReview`, adminReview);
  app.use(`${baseUrl}/testimonial`, testimonials);
  app.use(`${baseUrl}/video`, video);
  app.use(`${baseUrl}/order`,orderRoute)

};
