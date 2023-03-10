import express from "express"
import { getAllJampads, getNearbyPads, getPadById, getSlotsByDate } from "../controllers/pads.controller";
import { isCustomer, isOwner, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.route("/get/pads").get(protect, isOwner, getAllJampads);
router.route("/get/pads/:latitude/:longitude").get(protect, isCustomer, getNearbyPads);
router.route("/get/pad/:id").get(protect, isCustomer, getPadById);
router.route("/get/slots/:id").post(protect, isCustomer, getSlotsByDate);

export default router;