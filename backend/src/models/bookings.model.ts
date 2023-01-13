import mongoose from "mongoose";
import Pads from "./pad.model";

interface ISlot {
    date: string,
    time: Array<string>
}

export interface IBookings {
    _id: string,
    customer: mongoose.Schema.Types.ObjectId,
    pad: mongoose.Schema.Types.ObjectId,
    slots: Array<ISlot>,
    isPaid: boolean,
    paidAt: string
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
    slots: [
        {
            date: {
                type: String,
            },
            time: [
                {
                    type: String
                }
            ]
        }
    ],
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: String
    }
}, { timestamps: true });

// post hook method
bookingSchema.post("save", function (doc, next: any) {
    setTimeout(async () => {
        if (this.isPaid) {
            return next()
        };
        const pad = await Pads.findById(this.pad);
        for (let element of pad!.bookings) {
            for (let i of this.slots) {
                if (element.date === i.date) {
                    element.slots = [...element.slots, ...i.time];
                    await pad!.save();
                    break;
                };
            };
        };
        await doc.remove();
        return next();
    }, 900000);
});

// statics
bookingSchema.statics.instanceOfIBookings = (param: any): param is IBookings => {
    return param.pad !== undefined;
};

const Bookings = mongoose.model<IBookings, IBookingsModel>("Bookings", bookingSchema);
export default Bookings;