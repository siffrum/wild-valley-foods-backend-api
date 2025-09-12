import { 
  CustomerDetail as Customer, 
  CustomerAddressDetail as CustomerAddress 
} from "../../db/dbconnection.js";
import razorpay from "../../route/customer/razorpay.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";

// ✅ CREATE CUSTOMER
export const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, contact, addresses } = req.body;

    // Step 1: Razorpay me create
    const razorpayCustomer = await razorpay.customers.create({
      name: `${firstName} ${lastName}`,
      email,
      contact,
    });

    // Step 2: Apne DB me save
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      contact,
      razorpayCustomerId: razorpayCustomer.id,
      createdBy: req.user?.id || null,
    });

    // Step 3: Address agar diya ho to save
    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        await CustomerAddress.create({
          customerDetailId: customer.id,
          ...addr,
          createdBy: req.user?.id || null,
        });
      }
    }

    return sendSuccess(res, { ...customer.toJSON(), razorpay: razorpayCustomer }, 201);
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

    return sendSuccess(res, customer);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ GET ALL CUSTOMERS
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [{ model: CustomerAddress, as: "addresses" }],
    });
    return sendSuccess(res, customers);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ UPDATE CUSTOMER
export const updateCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, contact } = req.body;

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return sendError(res, "Customer not found", 404);

    // Razorpay update bhi karein
    await razorpay.customers.edit(customer.razorpayCustomerId, {
      name: `${firstName} ${lastName}`,
      email,
      contact,
    });

    await customer.update({
      firstName,
      lastName,
      email,
      contact,
      lastModifiedBy: req.user?.id || null,
    });

    return sendSuccess(res, customer);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ DELETE CUSTOMER (Note: Razorpay direct delete support nahi deta)
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
