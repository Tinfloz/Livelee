import { Response, Request } from "express";
import { getLatLng } from "../helpers/get.lat.lng";
import Users from "../models/all.user.model";
import Customers from "../models/customer.model";
import Owners from "../models/owner.model";
import { getAccessToken } from "../utils/get.token";
import { addressZod, userAuthZod } from "../zod/user.controller.zod";

// register
const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = userAuthZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const { email, password, phone, userType } = result.data;
        const userExists = await Users.findOne({
            email
        });
        if (userExists) {
            throw "user already exists"
        };
        const user = await Users.create({
            email, password, phone: Number(phone), userType
        });
        let loginUser;
        if (userType === "Customer") {
            loginUser = await Customers.create({
                userId: user._id
            });
        } else {
            loginUser = await Owners.create({
                userId: user._id
            });
        };
        let sendUser = {
            email,
            token: getAccessToken(user._id),
            userType,
            loginUser
        }
        res.status(200).json({
            sendUser
        });
        return
    } catch (error: any) {
        if (error === "user already exists") {
            res.status(400).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else {
            res.status(500).json({
                succes: false,
                error: error.errors?.[0]?.message || error
            });
        };
    };
};

// login
const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = userAuthZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const user = await Users.findOne({
            email: result.data.email
        });
        if (user && await user.matchPassword(result.data.password)) {
            let loginUser;
            if (user.userType === "Customer") {
                loginUser = await Customers.findOne({
                    userId: user._id
                });
            } else {
                loginUser = await Owners.findOne({
                    userId: user._id
                });
            };
            let sendUser = {
                email: result.data.email,
                token: getAccessToken(user._id),
                userType: user.userType,
                loginUser
            };
            res.status(200).json({
                sendUser
            });
            return
        };
        if (!user) {
            throw "user not found"
        } else {
            throw "passwords don't match"
        }
    } catch (error: any) {
        if (error === "user not found") {
            res.status(404).json({
                succes: false,
                error: error.errors?.[0]?.message || error
            });
        } else if (error === "passwords don't match") {
            res.status(400).json({
                succes: false,
                error: error.errors?.[0]?.message || error
            });
        } else {
            res.status(500).json({
                succes: false,
                error: error.errors?.[0]?.message || error
            });
        };
    };
};

// set address
const setAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = addressZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const { address, city, state, pincode } = result.data;
        const setAddress = `${address}, ${city}`;
        const [latitude, longitude] = await getLatLng(setAddress);
        const customer = await Customers.findOneAndUpdate({
            userId: req.user!._id
        }, { address, city, state, pincode, latitude, longitude }, { new: true });
        await customer!.save();
        res.status(200).json({
            success: true,
            address, city, state, pincode
        });
        return
    } catch (error: any) {
        if (error === "route not permissible") {
            res.status(403).json({
                succes: false,
                error: error.errors?.[0]?.message || error
            });
        } else {
            res.status(500).json({
                succes: false,
                error: error.errors?.[0]?.message || error
            });
        };
    };
};

export {
    login,
    register,
    setAddress
}

