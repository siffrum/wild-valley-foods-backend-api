// helpers/paymentLink.helper.js
import razorpay from "../route/customer/razorpay.js";

/**
 * Generate payment link for an order
 * @param {Object} order - Order object from database
 * @param {Object} customer - Customer object from database
 * @param {number} amount - Order amount
 * @returns {Promise<Object>} Razorpay payment link response
 */
export const generateOrderPaymentLink = async (order, customer, amount) => {
  try {
    // Calculate expire_by as current time + 16 minutes (to ensure it's at least 15 minutes in future)
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const expireBy = currentTimeInSeconds + (16 * 60); // 16 minutes from now

    const options = {
      amount: Math.round(amount * 100), // Convert to paise for Razorpay
      currency: "INR",
      customer: {
        id: customer.razorpayCustomerId
      },
      description: `Order #${order.id} Payment`,
      expire_by: expireBy,
      reference_id: order.razorpayOrderId,
      notes: {
        orderId: order.id,
        customerId: customer.id,
        razorpayOrderId: order.razorpayOrderId,
        internalOrderId: order.id
      }
    };

    console.log("🕒 Payment Link Options:", {
      amount: options.amount,
      expire_by: expireBy,
      current_time: currentTimeInSeconds,
      difference_minutes: (expireBy - currentTimeInSeconds) / 60
    });

    const paymentLink = await razorpay.paymentLink.create(options);
    return paymentLink;
    
  } catch (error) {
    console.error("❌ PAYMENT LINK GENERATION ERROR:", error);
    
    // Better error message with specific details
    if (error.statusCode === 400 && error.error?.description) {
      throw new Error(`Payment gateway error: ${error.error.description}`);
    } else if (error.error?.code === 'BAD_REQUEST_ERROR') {
      throw new Error(`Payment gateway validation error: ${error.error.description}`);
    } else {
      throw new Error(`Failed to generate payment link: ${error.message || 'Unknown error'}`);
    }
  }
};