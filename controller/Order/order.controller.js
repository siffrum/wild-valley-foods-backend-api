import { Order, OrderRecord, CustomerDetail, Product } from "../../db/dbconnection.js";
import razorpay from "../../route/customer/razorpay.js";
import crypto from "crypto";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";
import { generateOrderPaymentLink } from "../../Helper/razorpay.payment.helper.js";

export const createOrder = async (req, res) => {
  try {
    const { customerId, items } = req.body.reqData;
    
    if (!customerId || !items?.length) {
      return sendError(res, "Customer ID and items are required", 400);
    }

    // Validate customer exists
    const customer = await CustomerDetail.findByPk(customerId);
    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }

    if (!customer.razorpayCustomerId) {
      return sendError(res, "Customer does not have Razorpay ID", 400);
    }

    // Fetch products and calculate amount
    const products = await Product.findAll({
      where: { id: items.map(i => i.productId) },
    });

    // Validate all products exist
    const missingProducts = items.filter(i => 
      !products.find(p => p.id === i.productId)
    );
    
    if (missingProducts.length > 0) {
      return sendError(res, `Products not found: ${missingProducts.map(p => p.productId).join(', ')}`, 404);
    }

    let amount = 0;
    const enrichedItems = items.map(i => {
      const product = products.find(p => p.id === i.productId);
      const total = Number(product.price) * Number(i.quantity);
      amount += total;
      
      return {
        ...i,
        price: product.price,
        total,
        productDetails: {
          name: product.name,
          sku: product.sku,
          currency: product.currency,
          unit: product.unit
        }
      };
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${customerId}`,
      notes: { 
        customerId,
        internalCustomerId: customerId 
      }
    });

    // Create order in database
    const order = await Order.create({
      customerId,
      razorpayOrderId: razorpayOrder.id,
      amount,
      due_amount: amount, // Initially due amount equals total amount
      currency: "INR",
      receipt: razorpayOrder.receipt,
      status: "created",
      createdBy: req.user?.id || null
    });

    // Create order records
    const orderRecords = [];
    for (const item of enrichedItems) {
      const record = await OrderRecord.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        createdBy: req.user?.id || null
      });
      
      orderRecords.push({
        ...record.toJSON(),
        productDetails: item.productDetails
      });
    }

    console.log("✅ Order created successfully, generating payment link...");

    // Generate payment link
    const paymentLink = await generateOrderPaymentLink(order, customer, amount);

    console.log("✅ Payment link generated successfully");

    // Prepare response
    const response = {
      order: {
        ...order.toJSON(),
        items: orderRecords,
        razorpayOrder,
        customerDetails: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          contact: customer.contact
        }
      },
      paymentLink: {
        id: paymentLink.id,
        short_url: paymentLink.short_url,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        status: paymentLink.status,
        expire_by: paymentLink.expire_by,
        created_at: paymentLink.created_at
      }
    };

    return sendSuccess(res, response, 201);

  } catch (err) {
    console.error("❌ CREATE ORDER ERROR:", err);
    
    // Handle specific Razorpay errors
    if (err.error?.code) {
      return sendError(res, `Payment gateway error: ${err.error.description}`, 400);
    }
    
    return sendError(res, err.message || "Internal server error");
  }
};
// ✅ Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.reqData;

    const order = await Order.findOne({ where: { razorpayOrderId: razorpay_order_id } });
    if (!order) return sendError(res, "Order not found", 404);

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) return sendError(res, "Invalid signature", 400);

    await order.update({
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "paid"
    });

    return sendSuccess(res, { message: "Payment verified", order });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ Get all orders with pagination and product details
export const getAllOrders = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;

    const orders = await Order.findAll({
      offset: skip,
      limit: top,
      include: [
        { model: OrderRecord, as: "items" },
        { model: CustomerDetail, as: "customer" }
      ],
      order: [["createdOnUTC", "DESC"]]
    });

    // Collect all unique product IDs from all order items
    const allProductIds = [...new Set(orders.flatMap(o => o.items.map(i => i.productId)))];

    // Fetch all products at once
    const products = await Product.findAll({ where: { id: allProductIds } });
    const productMap = Object.fromEntries(products.map(p => [p.id, {
      name: p.name,
      sku: p.sku,
      currency: p.currency,
      unit: p.unit,
      price: p.price
    }]));

    // Map product details to order items
    for (const order of orders) {
      order.items.forEach(item => {
        item.dataValues.productDetails = productMap[item.productId] || {};
      });
    }

    return sendSuccess(res, orders);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ Get single order by ID with product details
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderRecord, as: "items" }]
    });
    if (!order) return sendError(res, "Order not found", 404);

    const productIds = order.items.map(i => i.productId);
    const products = await Product.findAll({ where: { id: productIds } });
    const productMap = Object.fromEntries(products.map(p => [p.id, {
      name: p.name,
      sku: p.sku,
      currency: p.currency,
      unit: p.unit,
      price: p.price
    }]));

    order.items.forEach(item => {
      item.dataValues.productDetails = productMap[item.productId] || {};
    });

    return sendSuccess(res, order);
  } catch (err) {
    return sendError(res, err.message);
  }
};
