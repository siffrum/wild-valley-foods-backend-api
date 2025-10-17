import { Router } from "express";
import {
  createCustomer,
  getCustomerById,
  getAllCustomersPaginated,
  updateCustomer,
  deleteCustomer,
} from "../../controller/customer-controller/customer.controller.js";

const r = Router();

r.post("/", createCustomer);
r.get("/", getAllCustomersPaginated);
r.get("/:id", getCustomerById);
r.put("/:id", updateCustomer);
r.delete("/:id", deleteCustomer);

export default r;
