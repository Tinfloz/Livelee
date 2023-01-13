import Owners from "../models/owner.model";
import moment from "moment";
import { Request, Response } from "express";
import { addressChangeZod, changeIntervalZod, changePadZod, createJamPadZod, timeChangeZod } from "../zod/owner.controller.zod";
import Pads from "../models/pad.model";
import { getLatLng } from "../helpers/get.lat.lng";
import mongoose from "mongoose";

// create jampads
const createJampads = async (req: Request, res: Response): Promise<void> => {
    try {
        const owner = await Owners.findOne({
            userId: req.user!._id
        });
        const result = createJamPadZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const { name, image, address, city, state, pincode,
            equipment, opening, closing, interval } = result.data;
        const startTime = moment(opening, "HH:mm");
        const closingTime = moment(closing, "HH:mm");
        let slotArray = [];
        let bookingAvailability = [];
        while (startTime.format("HH:mm") !== closingTime.format("HH:mm")) {
            let slot = `${startTime.format("HH:mm")}-${startTime.add(Number(interval), "m").format("HH:mm")}`;
            slotArray.push(slot)
        };
        let startDay = moment(new Date());
        let endDay = moment(startDay.clone().add(1, "y"));
        while (startDay.format("DD/MM/YYYY") !== endDay.format("DD/MM/YYYY")) {
            let slotPerDay = {
                date: startDay.format("DD/MM/YYYY"),
                slots: slotArray
            };
            startDay.add(1, "d");
            bookingAvailability.push(slotPerDay)
        };
        const setAddress = `${address}, ${city}`;
        const [latitude, longitude] = await getLatLng(setAddress)
        const pad = await Pads.create({
            name,
            image,
            address,
            city,
            state,
            pincode,
            latitude,
            longitude,
            equipment,
            opening,
            closing,
            interval: Number(interval),
            bookings: bookingAvailability,
            owner: owner!._id
        });
        if (!pad) {
            throw "could not be created"
        }
        owner!.pad.push(pad._id);
        await owner!.save();
        res.status(200).json({
            success: true
        });
        return
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.errors?.[0]?.message || error
        });
    };
};

// change interval 
// TODO: add cancellation logic after change
const changeInterval = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "invalid id"
        };
        const result = changeIntervalZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const owner = await Owners.findOne({
            userId: req.user!._id
        });
        const pad = await Pads.findById(id);
        if (!pad) {
            throw "pad not found"
        };
        if (pad!.owner.toString() !== owner!._id.toString()) {
            throw "not authorised"
        };
        pad!.interval = Number(result.data.interval);
        let slotsArray = [];
        let startTime = moment(pad!.opening, "HH:mm");
        let closingTime = moment(pad!.closing, "HH:mm");
        while (startTime.format("HH:mm") !== closingTime.format("HH:mm")) {
            let slots = `${startTime.format("HH:mm")}-${startTime.add(Number(result.data.interval), "m").format("HH:mm")}`;
            slotsArray.push(slots);
        };
        for (let element of pad!.bookings) {
            element.slots = slotsArray;
        };
        await pad!.save();
        res.status(200).json({
            success: true
        });
        return
    } catch (error: any) {
        if (error === "pad not found") {
            res.status(404).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else if (error === "not authorised") {
            res.status(403).json({
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

// change opening or closing time
const editTimes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "invalid id"
        };
        const result = timeChangeZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const owner = await Owners.findOne({
            userId: req.user!._id
        });
        const pad = await Pads.findById(id);
        if (!pad) {
            throw "pad not found";
        };
        if (pad!.owner.toString() !== owner!._id.toString()) {
            throw "not authorised";
        };
        pad!.opening = result.data.opening || pad!.opening;
        pad!.closing = result.data.closing || pad!.closing;
        const openingTime = moment(result.data.opening || pad!.opening, "HH:mm");
        const closingTime = moment(result.data.closing || pad!.closing, "HH:mm");
        let slotsArray = [];
        while (openingTime.format("HH:mm") !== closingTime.format("HH:mm")) {
            let timeSlots = `${openingTime.format("HH:mm")}-${openingTime.add(Number(pad!.interval), "m").format("HH:mm")}`;
            slotsArray.push(timeSlots);
        };
        for (let element of pad!.bookings) {
            element.slots = slotsArray;
        };
        await pad!.save();
        res.status(200).json({
            success: true
        });
        return
    } catch (error: any) {
        if (error === "pad not found") {
            res.status(404).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else if (error === "not authorised") {
            res.status(403).json({
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

// delte jampad listing
const deleteListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "invalid id";
        };
        const pad = await Pads.findById(id);
        const owner = await Owners.findOne({
            userId: req.user!._id
        });
        if (!pad) {
            throw "pad not found";
        };
        if (pad!.owner.toString() !== owner?._id.toString()) {
            throw "not authorised";
        };
        for (let element of owner!.pad) {
            if (element.toString() === id) {
                let index = owner!.pad.indexOf(element);
                owner!.pad.splice(index, 1);
                break;
            };
        };
        await pad!.remove();
        await owner!.save();
        res.status(200).json({
            success: true,
            id
        });
        return
    } catch (error: any) {
        if (error === "pad not found") {
            res.status(404).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else if (error === "not authorised") {
            res.status(403).json({
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

// change jam room details
const changeDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id invalid"
        };
        const owner = await Owners.findOne({
            userId: req.user!._id
        });
        const pad = await Pads.findById(id);
        if (!pad) {
            throw "pad not found"
        };
        if (pad!.owner.toString() !== owner?._id.toString()) {
            throw "not authorised";
        };
        const result = changePadZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const { name, image, equipment } = result.data;
        pad!.name = name || pad!.name;
        pad!.image = image || pad!.image;
        pad!.equipment = equipment || pad!.equipment;
        await pad!.save();
        res.status(200).json({
            success: true,
        })
    } catch (error: any) {
        if (error === "pad not found") {
            res.status(404).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else if (error === "not authorised") {
            res.status(403).json({
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

// change address
const changePadAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id invalid"
        };
        const owner = await Owners.findOne({
            userId: req.user!._id
        });
        const pad = await Pads.findById(id);
        if (!pad) {
            throw "pad not found"
        };
        if (pad!.owner.toString() !== owner?._id.toString()) {
            throw "not authorised";
        };
        const result = addressChangeZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const { address, state, city, pincode } = result.data;
        const setAddress = `${address}, ${city}`;
        const [latitude, longitude] = await getLatLng(setAddress);
        pad!.address = address;
        pad!.state = state;
        pad!.city = city;
        pad!.pincode = pincode;
        pad!.latitude = latitude;
        pad!.longitude = longitude;
        await pad!.save();
        res.status(200).json({
            success: true
        });
        return
    } catch (error: any) {
        if (error === "pad not found") {
            res.status(404).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else if (error === "not authorised") {
            res.status(403).json({
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
    createJampads,
    changeInterval,
    editTimes,
    deleteListing,
    changeDetails,
    changePadAddress
}