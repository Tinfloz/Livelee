import express from "express";
import { cancelBookingOwner, changeDetails, changeInterval, changePadAddress, createJampads, deleteListing, editTimes, getAllBookings } from "../controllers/owner.controller";
import { isOwner, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.route("/create/pad").post(protect, isOwner, createJampads);
router.route("/change/interval/:id").post(protect, isOwner, changeInterval);
router.route("/change/times/:id").post(protect, isOwner, editTimes);
router.route("/delete/listing/:id").delete(protect, isOwner, deleteListing);
router.route("/change/attributes/:id").post(protect, isOwner, changeDetails);
router.route("/change/address/:id").post(protect, isOwner, changePadAddress);
router.route("/cancel/booking/owner/:id").get(protect, isOwner, cancelBookingOwner);
router.route("/get/bookings").get(protect, isOwner, getAllBookings);


export default router;