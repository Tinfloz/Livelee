import Owners from "../models/owner.model";
import moment from "moment";
import { Request, Response } from "express";
import { addressChangeZod, changeIntervalZod, changePadZod, createJamPadZod, timeChangeZod } from "../zod/owner.controller.zod";
import Pads from "../models/pad.model";
import { getLatLng } from "../helpers/get.lat.lng";
import mongoose from "mongoose";
import nodeCron from "node-cron";
import Bookings from "../models/bookings.model";
import Customers from "../models/customer.model";
import Users from "../models/all.user.model";
import { sendEmail } from "../utils/send.email";

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
            equipment, opening, closing, interval, rate } = result.data;
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
            rate: Number(rate),
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

// delete jampad listing
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

// cancel a booking
const cancelBookingOwner = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id invalid";
        };
        const booking = await Bookings.findById(id).populate("pad");
        if (!booking) {
            throw "booking not found";
        };
        const customer = await Customers.findById(booking.customer).populate("userId");
        const pad = await Pads.findById(booking.pad);
        if (!customer) {
            throw "customer not found";
        };
        let owner: any;
        if (Pads.instanceOfIpad(booking.pad)) {
            owner = await Owners.findById(booking.pad.owner).populate("userId");
        };
        for (let element of owner!.bookings) {
            if (element.toString() === id) {
                let index = owner!.bookings.indexOf(element);
                owner!.bookings.splice(index, 1);
                break;
            };
        };
        for (let element of customer.bookings) {
            if (element.toString() === id) {
                let index = customer.bookings.indexOf(element);
                customer.bookings.splice(index, 1);
                break;
            };
        };
        for (let element of pad!.bookings) {
            if (element.date === booking.slots.date) {
                element.slots = [...element.slots, ...booking.slots.time];
                break;
            };
        };
        if (Users.instanceOfUser(customer.userId)) {
            try {
                const subject = `Booking ID: ${booking._id} has been cancelled by the owner!`;
                const email = customer.userId.email;
                const emailToSend = "Sorry for the inconvenience caused. Kindly, book a new slot!"
                await sendEmail({
                    subject,
                    email,
                    emailToSend
                });
            } catch (error) {
                throw new Error("email could not be sent", { cause: error });
            };
        };
        await booking.remove();
        await customer.save();
        await owner!.save();
        await pad!.save();
        res.status(200).json({
            success: true,
            id
        });
        return
    } catch (error: any) {
        if (error === "customer not found" || "booking not found") {
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

// cron job
nodeCron.schedule("0 0 * * * ", async (): Promise<void> => {
    let arrayOfOldListings = [];
    for await (let pad of Pads.find()) {
        const startDay = moment(pad.created, "DD/MM/YYYY");
        const today = moment();
        const oneYear = moment(startDay.clone(), "DD/MM/YYYY").add(1, "year");
        if (today.format("DD/MM/YYYY") === oneYear.format("DD/MM/YYYY")) {
            arrayOfOldListings.push(pad);
        };
    };
    if (arrayOfOldListings.length === 0) {
        console.log("ran")
        return
    };
    for (let element of arrayOfOldListings) {
        const owner = await Owners.findById(element.owner).populate("userId");
        if (Users.instanceOfUser(owner!.userId)) {
            try {
                const email = owner!.userId.email;
                const subject = `Renew listing ${element.name} on Livelee!`;
                const emailToSend = `
                Hello,
                
                Please renew listing ${element.name} on Livelee!
                
                Best, 
                Team Livelee
                `
                await sendEmail({
                    email, subject, emailToSend
                });
            } catch (error) {
                console.log(error)
            };
        };
        await element.remove();
        return
    };
});

export {
    createJampads,
    changeInterval,
    editTimes,
    deleteListing,
    changeDetails,
    changePadAddress,
    cancelBookingOwner
}