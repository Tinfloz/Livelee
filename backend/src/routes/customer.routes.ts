import express from "express";
import { bookSlots, cancelBooking, createRzpOrder, updatePaymentToPaid } from "../controllers/customer.controller";
import { isCustomer, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.route("/book/:id").post(protect, isCustomer, bookSlots);
router.route("/create/checkout/order/:id").get(protect, isCustomer, createRzpOrder);
router.route("/verify/payment/:id").post(protect, isCustomer, updatePaymentToPaid);
router.route("/cancel/booking/:id").get(protect, isCustomer, cancelBooking);

export default router;