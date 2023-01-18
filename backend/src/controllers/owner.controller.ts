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
import { bookingZod } from "../zod/customer.controller.zod";

// create jampads
const createJampads = async (req: Request, res: Response): Promise<void> => {
    try {
        const owner = await Owners.findOne({
            userId: req.user!._id
        });
        console.log(req.body);
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
        console.log(setAddress)
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
            success: true,
            id: pad._id
        });
        return
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            success: false,
            error: error.errors?.[0]?.message || error
        });
    };
};

// change interval
const changeInterval = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id invalid";
        };
        const result = changeIntervalZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const pad = await Pads.findById(id);
        const owner = await Owners.findOne({
            userId: req.user!._id
        }).populate("bookings");
        if (!pad) {
            throw "pad not found";
        };
        if (pad.owner.toString() !== owner!._id.toString()) {
            throw "not authorised"
        };
        pad.interval = Number(result.data.interval);
        let slotsArray = [];
        while (moment(pad.opening, "DD/MM/YYYY").format("DD/MM/YYYY") !== moment(pad.closing, "DD/MM/YYYY").format("DD/MM/YYYY")) {
            let slotRange = `${moment(pad.opening, "DD/MM/YYYY").format("DD/MM/YYYY")}-${moment(pad.opening, "DD/MM/YYYY").add(Number(result.data.interval), "minutes").format("DD/MM/YYYY")}`;
            slotsArray.push(slotRange);
        };
        for (let element of pad.bookings) {
            element.slots = slotsArray;
        };
        for (let element of owner!.bookings) {
            if (Bookings.instanceOfIBookings(element)) {
                if (element.pad.toString() === id) {
                    const customer = await Customers.findById(element.customer).populate("userId");
                    try {
                        if (Users.instanceOfUser(customer!.userId)) {
                            let email = customer!.userId.email;
                            let subject = `Booking ID: ${element._id} cancelled!`
                            let emailToSend = `
                            Dear Customer,

                            Booking ID: ${element._id} has been cancelled by the owner due to a renewed scheduling! 
                            Sorry for the inconvenience caused! You are free to re-book your slots.
                            
                            Best,
                            Team Livelee
                            `
                            await sendEmail({
                                email, subject, emailToSend
                            });
                        }
                    } catch (error: any) {
                        console.log(error);
                    };
                    for (let i of customer!.bookings) {
                        if (i.toString() === element._id.toString()) {
                            let index = customer!.bookings.indexOf(i);
                            customer!.bookings.splice(index, 1);
                        };
                    };
                    let index = owner!.bookings.indexOf(element);
                    owner!.bookings.splice(index, 1);
                    Bookings.findByIdAndRemove(element._id);
                    await customer!.save();
                };
            };
        };
        await owner!.save();
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

// edit opening and closing times
const editTimes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "invalid id";
        };
        const result = timeChangeZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const pad = await Pads.findById(id);
        const owner = await Owners.findOne({
            userId: req.user!._id
        }).populate("bookings");
        if (!pad) {
            throw "pad not found";
        };
        if (pad.owner.toString() === owner!._id.toString()) {
            throw "not authorised";
        };
        const { opening, closing } = result.data;
        pad.opening = opening || pad.opening;
        pad.closing = closing || pad.closing;
        let slotsArray = [];
        while (moment(opening || pad.opening, "DD/MM/YYYY").format("DD/MM/YYYY") !== moment(closing || pad.closing, "DD/MM/YYYY").format("DD/MM/YYYY")) {
            let rangeEl = `${moment(opening || pad.opening, "DD/MM/YYYY").format("DD/MM/YYYY")}-${moment(opening || pad.opening, "DD/MM/YYYY").add(pad.interval, "minutes").format("DD/MM/YYYY")}`
            slotsArray.push(rangeEl);
        };
        for (let element of pad.bookings) {
            element.slots = slotsArray;
        };
        for (let element of owner!.bookings) {
            if (Bookings.instanceOfIBookings(element)) {
                if (element.pad.toString() === id) {
                    const customer = await Customers.findById(element.customer).populate("userId");
                    try {
                        if (Users.instanceOfUser(customer!.userId)) {
                            let email = customer!.userId.email;
                            let subject = `Booking ID: ${element._id} cancelled`;
                            let emailToSend = `
                            Dear Customer,

                            Booking ID: ${element._id} has been cancelled by the owner due to a renewed scheduling! 
                            Sorry for the inconvenience caused! You are free to re-book your slots.
                            
                            Best,
                            Team Livelee
                            `
                            await sendEmail({
                                email, subject, emailToSend
                            });
                        }
                    } catch (error: any) {
                        console.log(error);
                    };
                    for (let i of customer!.bookings) {
                        if (element._id.toString() === i.toString()) {
                            let index = customer!.bookings.indexOf(i);
                            customer!.bookings.splice(index, 1);
                        };
                    };
                    let index = owner!.bookings.indexOf(element);
                    owner!.bookings.splice(index, 1);
                    Bookings.findByIdAndRemove(element._id);
                    await customer!.save();
                };
            };
        };
        await pad!.save();
        await owner!.save();
        res.status(200).json({
            success: true,
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

// get all bookings 
const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const owner = await Owners.findOne({
            userId: req.user!._id
        }).populate({
            path: "bookings",
            populate: {
                path: "pad",
                select: "_id image name address city"
            }
        });
        res.status(200).json({
            success: true,
            bookings: owner!.bookings
        });
        return
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.errors?.[0]?.message || error
        });
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
    };
    return
});

export {
    createJampads,
    changeInterval,
    editTimes,
    deleteListing,
    changeDetails,
    changePadAddress,
    cancelBookingOwner,
    getAllBookings,
}

