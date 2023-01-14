import mongoose from "mongoose";
import Customers from "../models/customer.model";
import Bookings from "../models/bookings.model";
import Pads from "../models/pad.model";
import Owners from "../models/owner.model";
import { Request, Response } from "express";
import { bookingZod, verifyPaymentZod } from "../zod/customer.controller.zod";
import moment from "moment";
import razorpay from "razorpay";
import shortid from "shortid";
import crypto from "crypto"

const bookSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id invalid";
        };
        const result = bookingZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const pad = await Pads.findById(id);
        if (!pad) {
            throw "pad not found";
        };
        const customer = await Customers.findOne({
            userId: req.user!._id
        });
        const { date, slots } = result.data;
        const bookingDate = moment(date, "DD/MM/YYYY");
        const validityDate = moment(new Date(), "MM/DD/YYYY").add(3, "months");
        if (bookingDate.isAfter(validityDate)) {
            throw "not authorised to book"
        };
        for (let element of pad.bookings) {
            if (moment(element.date, "DD/MM/YYYY").format("DD/MM/YYYY") === moment(date, "DD/MM/YYYY").format("DD/MM/YYYY")) {
                for (let i of slots) {
                    if (!element.slots.includes(i)) {
                        throw "slot not available";
                    };
                    let index = element.slots.indexOf(i);
                    element.slots.splice(index, 1);
                };
                break;
            };
        };
        await pad.save();
        const booking = await Bookings.create({
            customer: customer!._id,
            pad: pad!._id,
            slots: {
                date,
                time: slots
            },
            total: slots.length * pad.rate
        });
        res.status(200).json({
            success: true,
            booking
        });
        return
    } catch (error: any) {
        if (error === "not authorised to book") {
            res.status(400).json({
                success: false,
                error: error.errors?.[0]?.message || error
            });
        } else if (error === "pad not found") {
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

// create rzp order
const createRzpOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id invalid";
        };
        const booking = await Bookings.findById(id);
        if (!booking) {
            throw "booking not found";
        };
        const rzpInstance = new razorpay({
            key_id: process.env.RZP_KEY_ID,
            key_secret: process.env.RZP_KEY_SECRET
        });

        const options = {
            amount: booking.total * 100,
            currency: "INR",
            receipt: shortid.generate(),
        };
        let rzpOrder;
        try {
            rzpOrder = await rzpInstance.orders.create(options);
        } catch (error: any) {
            throw new Error("order could not be created!", { cause: error });
        };
        res.status(200).json({
            success: true,
            rzpOrder
        });
        return
    } catch (error: any) {
        if (error === "booking not found") {
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

// update payment to paid
const updatePaymentToPaid = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id not valid"
        };
        const result = verifyPaymentZod.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error
            });
            return
        };
        const { orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature, } = result.data;
        const booking = await Bookings.findById(id).populate("pad");
        const customer = await Customers.findOne({
            userId: req.user!._id
        });
        if (Pads.instanceOfIpad(booking!.pad)) {
            var owner = await Owners.findById(booking!.pad.owner);
        };
        let shasum = crypto.createHmac("sha256", process.env.RZP_KEY_SECRET!);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`)
        let digest = shasum.digest("hex");
        if (digest !== razorpaySignature) {
            throw "payment not legit"
        };
        booking!.isPaid = true;
        booking!.paidAt = moment(new Date(), "DD/MM/YYYY").format("DD/MM/YYYY");
        booking!.rzpOrderId = razorpayOrderId;
        customer!.bookings.push(booking!._id);
        owner!.bookings.push(booking!._id);
        await booking!.save();
        await customer!.save();
        await owner!.save();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.errors?.[0]?.message || error
        });
    };
};

// cancel booking 
const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw "id invalid"
        };
        const customer = await Customers.findOne({
            userId: req.user!._id
        });
        const booking = await Bookings.findById(id);
        if (!booking) {
            throw "booking not found";
        };
        const pad = await Pads.findById(booking!.pad);
        const owner = await Owners.findById(pad!.owner);
        for (let element of customer!.bookings) {
            if (element.toString() === id) {
                let index = customer!.bookings.indexOf(element);
                customer!.bookings.splice(index, 1);
                break;
            };
        };
        for (let element of owner!.bookings) {
            if (element.toString() === id) {
                let index = owner!.bookings.indexOf(element);
                owner!.bookings.splice(index, 1);
                break;
            };
        };
        for (let element of pad!.bookings) {
            if (element.date = booking!.slots.date) {
                element.slots = [...element.slots, ...booking!.slots.time];
                break;
            };
        };
        await booking!.remove();
        await customer!.save();
        await owner!.save();
        await pad!.save();
        res.status(200).json({
            success: true,
            bookingId: id
        });
        return
    } catch (error: any) {
        if (error === "booking not found") {
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
    bookSlots,
    createRzpOrder,
    updatePaymentToPaid,
    cancelBooking
}