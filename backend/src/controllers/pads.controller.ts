import Pads from "../models/pad.model";
import Owners from "../models/owner.model";
import Customers from "../models/customer.model";
import { Request, Response } from "express";
import { getDistance } from "../helpers/get.distance";
import * as redis from "redis";
import mongoose from "mongoose";
import { dateBookingZod } from "../zod/pad.controller.zod";

const redisClient = redis.createClient();
redisClient.connect();

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
        const { latitude, longitude } = req.params;
        const customer = await Customers.findOne({
            userId: req.user!._id
        });
        let padsArray = [];
        if ((Math.round(customer!.latitude * 1e4) / 1e4) === (Math.round(Number(latitude) * 1e4) / 1e4) && customer!.longitude === Number(longitude)) {
            const data = await redisClient.get(`${customer!._id}NearbyPads`);
            if (data) {
                res.status(200).json({
                    success: true,
                    padsArray: JSON.parse(data)
                })
                return
            };
            for await (let pad of Pads.find().select("_id name image latitude longitude")) {
                let distance = getDistance(pad.latitude, pad.longitude, Number(latitude), Number(longitude));
                if (distance <= 8) {
                    padsArray.push(pad);
                };
            };
            redisClient.setEx(`${customer!._id}NearbyPads`, 600000, JSON.stringify(padsArray));
            res.status(200).json({
                success: true,
                padsArray
            });
            return
        };
        for await (let pad of Pads.find().select("_id name image latitude longitude")) {
            let distance = getDistance(pad.latitude, pad.longitude, Number(latitude), Number(longitude));
            if (distance <= 8) {
                padsArray.push(pad);
            };
        };
        res.status(200).json({
            success: true,
            padsArray
        });
        return
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.errors?.[0]?.message || error
        });
    };
};

// get pad by id
const getPadById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id invalid"
        };
        const pad = await Pads.findById(id).select("_id name image address city state pincode latitude longitude rate equipment");
        if (!pad) {
            throw "pad not found"
        };
        res.status(200).json({
            success: true,
            pad
        });
        return
    } catch (error: any) {
        if (error === "pad not found") {
            res.status(404).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        };
    };
};

// get slots by date 
const getSlotsByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "invalid id"
        };
        const pad = await Pads.findById(id);
        if (!pad) {
            throw "pad not found"
        };
        const result = dateBookingZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        let slots;
        for (let element of pad.bookings) {
            if (element.date === result.data.date) {
                slots = element.slots;
                break;
            };
        };
        res.status(200).json({
            success: true,
            slots
        });
        return
    } catch (error: any) {
        if (error === "pad not found") {
            res.status(404).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        };
    };
};

export {
    getAllJampads,
    getNearbyPads,
    getPadById,
    getSlotsByDate
}