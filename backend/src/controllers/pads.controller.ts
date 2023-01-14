import Pads from "../models/pad.model";
import Owners from "../models/owner.model";
import Customers from "../models/customer.model";
import { Request, Response } from "express";
import { getDistance } from "../helpers/get.distance";

// get all jam pads
const getAllJampads = async (req: Request, res: Response): Promise<void> => {
    try {
        const owner = await Owners.findOne({
            userId: req.user!._id
        }).populate("pad");
        res.status(200).json({
            success: true,
            pads: owner!.pad
        });
        return
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.errors?.[0]?.message || error
        });
    };
};

// get all near by pads
const getNearbyPads = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await Customers.findOne({
            userId: req.user!._id
        });
        let nearbyPads = [];
        for await (let pad of Pads.find()) {
            let distance = getDistance(pad.latitude, pad.longitude, customer!.latitude, customer!.longitude);
            if (distance <= 8) {
                nearbyPads.push(pad)
            };
        };
        res.status(200).json({
            success: true,
            nearbyPads
        });
        return
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.errors?.[0]?.message || error
        });
    };
};

export {
    getAllJampads,
    getNearbyPads
}