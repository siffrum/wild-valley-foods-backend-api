import { Router } from "express";
import crypto from "crypto";

const r = Router();

// Important: Use raw body for verification if needed. bodyParser.json works for most cases.
// If verification fails, consider using raw middleware for this route specifically.

r.post("/", (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  // const valid = signature === expected;

  // if (!valid) {
  //   return res.status(400).json({ received: true, valid: false });
  // }

  // Handle events: payment.authorized, payment.captured, order.paid, invoice.paid, refund.processed, etc.
  const event = req.body.event;
  // TODO: add your business logic per event

  res.json({ received: true, valid: true });
});

export default r;
