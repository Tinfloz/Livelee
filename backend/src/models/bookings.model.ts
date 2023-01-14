import mongoose from "mongoose";
import Pads from "./pad.model";

interface ISlot {
    date: string,
    time: Array<string>
}

export interface IBookings {
    _id: mongoose.Schema.Types.ObjectId,
    customer: mongoose.Schema.Types.ObjectId,
    pad: mongoose.Schema.Types.ObjectId,
    slots: ISlot,
    total: number,
    isPaid: boolean,
    paidAt: string,
    rzpOrderId: string
}

interface IBookingsModel extends mongoose.Model<IBookings> {
    instanceOfIBookings: (param: any) => param is IBookings
}

const bookingSchema = new mongoose.Schema<IBookings, IBookingsModel>({
    customer: {
        type: mongoose.Types.ObjectId,
        ref: "Customers"
    },
    pad: {
        type: mongoose.Types.ObjectId,
        ref: "Pads"
    },
    slots: {
        date: {
            type: String,
            required: true
        },
        time: [
            {
                type: String,
                required: true
            }
        ]
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    total: {
        type: Number,
        required: true
    },
    paidAt: {
        type: String
    },
    rzpOrderId: {
        type: String
    },
}, { timestamps: true });

// post hook method
bookingSchema.post("save", function (doc) {
    setTimeout(async () => {
        if (this.isPaid) {
            return
        };
        const pad = await Pads.findById(this.pad);
        for (let element of pad!.bookings) {
            if (element.date === this.slots.date) {
                element.slots = [...element.slots, ...this.slots.time];
                break;
            };
        };
        await pad!.save();
        await doc.remove();
    }, 900000);
});

// statics
bookingSchema.statics.instanceOfIBookings = (param: any): param is IBookings => {
    return param.pad !== undefined;
};

const Bookings = mongoose.model<IBookings, IBookingsModel>("Bookings", bookingSchema);
export default Bookings;