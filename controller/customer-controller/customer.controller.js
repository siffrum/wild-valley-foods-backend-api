import {
  CustomerDetail as Customer,
  CustomerAddressDetail as CustomerAddress,
} from "../../db/dbconnection.js";
import razorpay from "../../route/customer/razorpay.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";

/* ======================================================
   ✅ CREATE CUSTOMER (with optional addresses)
====================================================== */
export const createCustomer = async (req, res) => {
  try {
    const reqData = req.body.reqData || {};
    const { firstName, lastName, email, contact, addresses = [] } = reqData;

    // Check existing
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return sendError(res, "Customer with this email already exists", 400);
    }

    // Create Razorpay Customer
    const razorpayCustomer = await razorpay.customers.create({
      name: `${firstName} ${lastName}`,
      email,
      contact,
    });

    // Save in DB
    const customer = await Customer.create({
      ...reqData,
      razorpayCustomerId: razorpayCustomer.id,
      createdBy: req.user?.id || null,
    });

    // Save address records if provided
    if (addresses && addresses.length > 0) {
      const addressRecords = addresses.map((addr) => ({
        ...addr,
        customerDetailId: customer.id,
        createdBy: req.user?.id || null,
      }));
      await CustomerAddress.bulkCreate(addressRecords);
    }

    const fullCustomer = await Customer.findByPk(customer.id, {
      include: [{ model: CustomerAddress, as: "addresses" }],
    });

    const result = { ...fullCustomer.toJSON(), razorpay: razorpayCustomer };
    return sendSuccess(res, result, 201);
  } catch (err) {
    console.error("❌ CREATE CUSTOMER ERROR:", err);
    return sendError(res, err.message);
  }
};

/* ======================================================
   ✅ GET CUSTOMER BY ID
====================================================== */
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

/* ======================================================
   ✅ GET ALL CUSTOMERS (Paginated)
====================================================== */
export const getAllCustomersPaginated = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const top = parseInt(req.query.top) || 10;

    const customers = await Customer.findAll({
      offset: skip,
      limit: top,
      include: [{ model: CustomerAddress, as: "addresses" }],
      order: [["createdOnUTC", "DESC"]],
    });

    return sendSuccess(res, customers.map((c) => c.toJSON()));
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ======================================================
   ✅ UPDATE CUSTOMER (and addresses if provided)
====================================================== */
export const updateCustomer = async (req, res) => {
  try {
    const reqData = req.body.reqData || {};
    const { firstName, lastName, email, contact, addresses = [] } = reqData;

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return sendError(res, "Customer not found", 404);

    // Update in Razorpay
    if (customer.razorpayCustomerId) {
      await razorpay.customers.edit(customer.razorpayCustomerId, {
        name: `${firstName} ${lastName}`,
        email,
        contact,
      });
    }

    reqData.lastModifiedBy = req.user?.id || null;
    await customer.update(reqData);

    // Update addresses (simplified: delete & recreate)
    await CustomerAddress.destroy({ where: { customerDetailId: customer.id } });
    if (addresses && addresses.length > 0) {
      const addressRecords = addresses.map((addr) => ({
        ...addr,
        customerDetailId: customer.id,
        createdBy: req.user?.id || null,
      }));
      await CustomerAddress.bulkCreate(addressRecords);
    }

    const updatedCustomer = await Customer.findByPk(customer.id, {
      include: [{ model: CustomerAddress, as: "addresses" }],
    });

    return sendSuccess(res, updatedCustomer.toJSON());
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ======================================================
   ✅ DELETE CUSTOMER (Cascade delete addresses)
====================================================== */
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return sendError(res, "Customer not found", 404);

    await Customer.destroy({ where: { id: req.params.id } });
    // Sequelize cascade deletes CustomerAddressDetails
    return sendSuccess(res, { message: "Customer deleted successfully" });
  } catch (err) {
    return sendError(res, err.message);
  }
};

/* ======================================================
   ✅ SEPARATE CRUD FOR CUSTOMER ADDRESS
====================================================== */
export const createCustomerAddress = async (req, res) => {
  try {
    const reqData = req.body.reqData || {};
    const { customerDetailId } = reqData;

    const customer = await Customer.findByPk(customerDetailId);
    if (!customer) return sendError(res, "Customer not found", 404);

    const address = await CustomerAddress.create({
      ...reqData,
      createdBy: req.user?.id || null,
    });

    return sendSuccess(res, address, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateCustomerAddress = async (req, res) => {
  try {
    const reqData = req.body.reqData || {};
    const address = await CustomerAddress.findByPk(req.params.id);
    if (!address) return sendError(res, "Address not found", 404);

    reqData.lastModifiedBy = req.user?.id || null;
    await address.update(reqData);

    return sendSuccess(res, address);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteCustomerAddress = async (req, res) => {
  try {
    const address = await CustomerAddress.findByPk(req.params.id);
    if (!address) return sendError(res, "Address not found", 404);

    await CustomerAddress.destroy({ where: { id: req.params.id } });
    return sendSuccess(res, { message: "Address deleted successfully" });
  } catch (err) {
    return sendError(res, err.message);
  }
};
