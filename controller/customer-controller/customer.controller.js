import { 
  CustomerDetail as Customer, 
  CustomerAddressDetail as CustomerAddress 
} from "../../db/dbconnection.js";
import razorpay from "../../route/customer/razorpay.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";

// ✅ CREATE CUSTOMER
export const createCustomer = async (req, res) => {
  try {
    const reqData = req.body.reqData || {}; // ✅ no JSON.parse
    const { firstName, lastName, email, contact } = reqData;

    // Step 0: Check if email already exists in DB
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return sendError(res, "Customer with this email already exists", 400);
    }

    // Step 1: Create in Razorpay
    const razorpayCustomer = await razorpay.customers.create({
      name: `${firstName} ${lastName}`,
      email,
      contact,
    });

    // Step 2: Save in DB
    const customer = await Customer.create({
      ...reqData,
      razorpayCustomerId: razorpayCustomer.id,
      createdBy: req.user?.id || null,
    });

    const result = { ...customer.toJSON(), razorpay: razorpayCustomer };
    return sendSuccess(res, result, 201);
  } catch (err) {
    console.error("❌ CREATE CUSTOMER ERROR:", err);
    return sendError(res, err.message);
  }
};



// ✅ GET CUSTOMER BY ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{ model: CustomerAddress, as: "addresses" }],
    });
    if (!customer) return sendError(res, "Customer not found", 404);

    return sendSuccess(res, customer.toJSON());
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ GET ALL CUSTOMERS (Paginated)
export const getAllCustomersPaginated = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const top = parseInt(req.query.top) || 10;

    const customers = await Customer.findAll({
      offset: skip,
      limit: top,
      include: [{ model: CustomerAddress, as: "addresses" }],
      order: [["createdAt", "DESC"]],
    });

    const result = customers.map(c => c.toJSON());
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ UPDATE CUSTOMER
export const updateCustomer = async (req, res) => {
  try {
    const reqData = req.body.reqData || {};
    const { firstName, lastName, email, contact } = reqData;

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return sendError(res, "Customer not found", 404);

    // Update in Razorpay
    await razorpay.customers.edit(customer.razorpayCustomerId, {
      name: `${firstName} ${lastName}`,
      email,
      contact,
    });

    reqData.lastModifiedBy = req.user?.id || null;
    await customer.update(reqData);

    return sendSuccess(res, customer.toJSON());
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ DELETE CUSTOMER
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return sendError(res, "Customer not found", 404);

    await Customer.destroy({ where: { id: req.params.id } });
    return sendSuccess(res, null);
  } catch (err) {
    return sendError(res, err.message);
  }
};
