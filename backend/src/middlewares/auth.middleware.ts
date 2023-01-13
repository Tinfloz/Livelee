import Users from "../models/all.user.model";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

// validate token
const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
            if (!token) {
                throw "no token"
            };
            const decoded = jwt.verify(token, process.env.JWT_SIGNATURE!) as JwtPayload;
            req.user = await Users.findById(decoded.id);
            if (!req.user) {
                throw "user not found"
            };
            return next()
        }
    } catch (error: any) {
        if (error === "no token") {
            res.status(400).json({
                success: false,
                message: error.errors?.[0]?.message || error
            });
        } else if (error === "user not found") {
            res.status(404).json({
                success: false,
                message: error.errors?.[0]?.message || error
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.errors?.[0]?.message || error
            });
        };
    };
};

// validate customer
const isCustomer = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.userType === "Customer") {
            return next()
        } else {
            throw "not authorized"
        };
    } catch (error: any) {
        res.status(403).json({
            success: false,
            message: error.errors?.[0]?.message || error
        });
    };
};

// validate owner
const isOwner = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.userType === "Owner") {
            return next()
        } else {
            throw "not authorized"
        }
    } catch (error: any) {
        res.status(403).json({
            success: false,
            message: error.errors?.[0]?.message || error
        });
    };
};

export {
    protect,
    isCustomer,
    isOwner
}