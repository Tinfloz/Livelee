import express from "express";
import { login, register, setAddress } from "../controllers/all.user.controller";
import { isCustomer, protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/set/address").post(protect, isCustomer, setAddress);

export default router;