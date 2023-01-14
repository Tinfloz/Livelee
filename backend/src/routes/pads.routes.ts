import express from "express"
import { getAllJampads, getNearbyPads } from "../controllers/pads.controller";
import { isCustomer, isOwner, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.route("/get/pads").get(protect, isOwner, getAllJampads);
router.route("/get/nearby/pads").get(protect, isCustomer, getNearbyPads);

export default router;