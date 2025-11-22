import { Order, CustomerDetail } from "../../db/dbconnection.js";
import { Router } from "express";
import crypto from "crypto";

const r = Router();
r.post("/", async (req, res) => {
  const event = req.body.event;
  const payload = req.body.payload;
  // const expectedSignature = crypto
  //   .createHmac("sha256", process.env.WEBHOOK_SECRET )
  //   .update(bodyString)
  //   .digest("hex");

  // if (signature !== expectedSignature) {
  //   console.log("❌ Invalid Razorpay Webhook Signature");
  //   return res.status(400).json({ success: false, message: "Invalid signature" });
  // }

  console.log(`\n📦 Razorpay Event Received: ${event}`);

  // ✅ temporarily trusting signature
  const signatureValid = true;

  if (!signatureValid) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  let eventData = { event };

  try {
    switch (event) {

      /* ---------------------------------------
       ✅ ORDER PAID (Order + Items + Customer)
      ----------------------------------------*/
      case "order.paid": {
        const payment = payload.payment.entity;
        const order = payload.order.entity;

        eventData = {
          event,
          orderId: order.id,
          paymentId: payment.id,
          amount: payment.amount,
          amountPaid: order.amount_paid,
          amountDue: order.amount_due,
          isPaymentcaptured: payment.captured,
          PaymentStatus: payment.status,
          OrderStatus:order.status,
          receipt: order.receipt,
          paymentUrl: payment.paymentUrl,
          email: payment.email,
          contact: payment.contact,
          currency: payment.currency
        };

        console.log("✅ ORDER PAID", eventData);

        // 🧠 Find internal order by receipt (internal orderId stored in receipt)
        const dbOrder = await Order.findOne({ where: { razorpayOrderId: order.id } });
        //const dbOrder2 = await Order.findOne({ where: { receipt: order.receipt } });
        if (!dbOrder) {
          console.log("⚠️ Order not found in DB");
          break;
        }

        // ✅ Update order only if not already marked paid
        if (dbOrder.paymentStatus !== "paid") {
          await dbOrder.update({
            paymentId: payment.id,
            paymentStatus: order.status,
            razorpayPaymentId: payment.id,
            paymentMethod: payment.method,
            paymentAmount: payment.amount / 100,
            currency: payment.currency
          });
        }

        break;
      }

      /* ---------------------------------------
       ✅ PAYMENT AUTHORIZED (capture later)
      ----------------------------------------*/
      case "payment.authorized": {
        const p = payload.payment.entity;
        eventData = {
          event,
          paymentId: p.id,
          orderId: p.order_id,
          amount: p.amount,
          status: p.status,
          email: p.email,
          contact: p.contact,
          currency: p.currency
        };

        const dbOrder = await Order.findOne({ where: { razorpayOrderId: p.id } });

        if (!dbOrder) {
          console.log("⚠️ Order not found in DB");
          break;
        }

        // ✅ Update order only if not already marked paid
        if (dbOrder.paymentStatus !== "paid") {
          await dbOrder.update({
            paymentId: payment.id,
            paymentStatus: p.status,
            razorpayPaymentId: payment.id,
            paymentMethod: payment.method,
            paymentAmount: payment.amount / 100,
            currency: payment.currency
          });
        }

        console.log("✅ PAYMENT AUTHORIZED", eventData);
        // Optional: mark pending authorization
        break;
      }

      /* ---------------------------------------
       ✅ PAYMENT CAPTURED
      ----------------------------------------*/
      case "payment.captured": {
        const p = payload.payment.entity;
        eventData = {
          event,
          paymentId: p.id,
          orderId: p.order_id,
          amount: p.amount,
          status: p.status,
          email: p.email,
          contact: p.contact,
          currency: p.currency
        };

        console.log("✅ PAYMENT CAPTURED", eventData);

        await Order.update(
          {
            paymentStatus: p.status,
            razorpayPaymentId: p.id,
            paymentAmount: p.amount / 100
          },
          { where: { razorpayOrderId: p.order_id } }
        );

        break;
      }

      /* ---------------------------------------
       ❌ PAYMENT FAILED
      ----------------------------------------*/
      case "payment.failed": {
        const p = payload.payment.entity;
        eventData = {
          event,
          paymentId: p.id,
          orderId: p.order_id,
          reason: p.error_description,
          status: p.status,
          email: p.email,
          contact: p.contact,
          currency: p.currency
        };

        console.log("❌ PAYMENT FAILED", eventData);

        await Order.update(
          { paymentStatus: p.status },
          { where: { razorpayOrderId: p.order_id } }
        );

        break;
      }

      /* ---------------------------------------
       ⚠️ INVOICE PARTIALLY PAID
      ----------------------------------------*/
      case "invoice.partially_paid": {
        const inv = payload.invoice.entity;

        eventData = {
          event,
          invoiceId: inv.id,
          orderId: inv.order_id,
          paidAmount: inv.amount_paid,
          due: inv.amount_due,
          customerEmail: inv.customer_details.email,
          customerName: inv.customer_details.name,
          InvoiceStatus: inv.status
        };

        console.log("⚠️ INVOICE PARTIALLY PAID", eventData);

        await Order.update(
          { paymentStatus: inv.status,
            paid_amount: inv.amount_paid,
            amount_due: inv.amount_due,
           },
          { where: { razorpayOrderId: inv.order_id } }
        );
        break;
      }

      /* ---------------------------------------
       ✅ INVOICE PAID
      ----------------------------------------*/
      case "invoice.paid": {
        const inv = payload.invoice.entity;

        eventData = {
          event,
          invoiceId: inv.id,
          orderId: inv.order_id,
          paidAmount: inv.amount_paid,
          customerEmail: inv.customer_details.email,
          customerName: inv.customer_details.name,
          InvoiceStatus: inv.status
        };

        console.log("✅ INVOICE PAID", eventData);

        await Order.update(
          { paymentStatus: inv.status },
          { where: { razorpayOrderId: inv.order_id } }
        );
        break;
      }

      /* ---------------------------------------
       ❌ INVOICE EXPIRED
      ----------------------------------------*/
      case "invoice.expired": {
        const inv = payload.invoice.entity;
        eventData = { event, invoiceId: inv.id, InvoiceStatus: inv.status };

        await Order.update(
          { paymentStatus: inv.status },
          { where: { razorpayOrderId: inv.order_id } }
        );
        console.log("⌛ INVOICE EXPIRED", eventData);
        break;
      }

      /* ---------------------------------------
       ✅ PAYMENT LINK PAID
      ----------------------------------------*/
      case "payment_link.paid": {
        const pl = payload.payment_link.entity;
      const p = payload.payment.entity;
      eventData = {
        event,
        paymentLinkId: pl.id,
        paymentId: p.id,
        amount: pl.amount,
        amountPaid: pl.amount_paid,
        orderId: pl.order_id,
        status: pl.status,
        customerEmail: pl.customer.email,
        customerContact: pl.customer.contact,
        paymentUrl: pl.short_url
      };

       await Order.update(
          { paymentStatus: inv.status },
          { where: { razorpayOrderId: pl.order_id } }
        );
        console.log("✅ PAYMENT LINK PAID", eventData);
        break;
      }

      /* ---------------------------------------
       ⚠️ PAYMENT LINK PARTIALLY PAID
      ----------------------------------------*/
      case "payment_link.partially_paid": {
        const pl = payload.payment_link.entity;
      const p = payload.payment.entity;
      const o = payload.order;
      eventData = {
        event,
        paymentLinkId: pl.id,
        paymentId: p.id,
        amount: pl.amount,
        amountDue: o.amount_due,
        isAmountCaptured: p.captured,
        amountPaid: pl.amount_paid,
        orderId: pl.order_id,
        status: pl.status,
        customerEmail: pl.customer.email,
        customerContact: pl.customer.contact,
        paymentUrl: pl.short_url
      };

      await Order.update(
          { 
            paymentStatus: p1.status,
            amount_paid: p1.amount_paid,
            amount_due: o.amount_due
          },
          { where: { razorpayOrderId: pl.order_id } }
        );
        console.log("⚠️ PAYMENT LINK PARTIALLY PAID", eventData);
        break;
      }

      /* ---------------------------------------
       ❌ PAYMENT LINK CANCELLED
      ----------------------------------------*/
      case "payment_link.cancelled": {
        const pl = payload.payment_link.entity;
      eventData = {
        event,
        paymentLinkId: pl.id,
        status: pl.status,
        cancelledAt: pl.cancelled_at,
        createdAt: pl.created_at,
        customerEmail: pl.customer.email,
        customerContact: pl.customer.contact,
      };
      //Todo:Handle payment link using customer data 
        console.log("❌ PAYMENT LINK CANCELLED", eventData);
        break;
      }

      /* ---------------------------------------
       ❌ PAYMENT LINK EXPIRED
      ----------------------------------------*/
      case "payment_link.expired": {
                const pl = payload.payment_link.entity;
      eventData = {
        event,
        paymentLinkId: pl.id,
        status: pl.status,
        expiredAt: pl.expired_at,
        customerEmail: pl.customer.email,
        customerContact: pl.customer.contact,
      };      

        console.log("⌛ PAYMENT LINK EXPIRED", eventData);
        break;
      }

      /* ---------------------------------------
       ⚠️ REFUND CREATED
      ----------------------------------------*/
      case "refund.created": 
      case "refund.processed":
      {
      const rp = payload.refund.entity;
      const p = payload.payment.entity;
      eventData = {
        event,
        refundId: rp.id,
        paymentId: rp.payment_id,
        amount: rp.amount,
        orderId: p.order_id,
        isAmountCaptured: p.captured,
        amountRefunded: p.amount_refunded,
        refundStatus: p.refund_status,
        customerEmail: p.email,
        customerContact: p.contact,
        fee:p.fee,
        tax:p.tax
      };

      await Order.update(
          { 
            paymentStatus: p.refund_status,
            amount_paid: p.amount_refunded
          },
          { where: { razorpayOrderId: p.order_id } }
        );
        // const customerDetails = await CustomerDetail.findOne({ where: { email: p.email } });
        // await Refund.create({
        //     razorpayRefundId: rp.id,
        //     paymentId: rp.payment_id,
        //     razorpayOrderId: p.order_id,
        //     customerDetailId: customerDetails.id,
        //     refundAmount: rp.amount / 100,
        //     refundStatus: p.refund_status,
        //     refundReason: rp.reason || null
        //   });
        console.log("⚠️ Partial Refund Suceessfully", eventData);
        break;
      }

      /* ---------------------------------------
       🌐 UNKNOWN EVENT
      ----------------------------------------*/
      default:
        eventData = { event, message: "Unhandled event" };
        console.log("ℹ️ Unhandled event:", event);
    }

    return res.status(200).json({ success: true, ...eventData });

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default r;
