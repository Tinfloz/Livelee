import mongoose from "mongoose";

export interface ISingleBooking {
    date: string,
    slots: Array<string>
}

export interface IPad {
    _id: mongoose.Schema.Types.ObjectId,
    name: string,
    owner: mongoose.Schema.Types.ObjectId,
    image: string,
    address: string,
    city: string,
    state: string,
    pincode: string,
    latitude: number,
    longitude: number,
    rate: number,
    equipment: string,
    opening: string,
    closing: string,
    interval: number,
    bookings: Array<ISingleBooking>
};

interface IPadModel extends mongoose.Model<IPad> {
    instanceOfIpad: (param: any) => param is IPad
}

const padSchema = new mongoose.Schema<IPad, IPadModel>({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "Owners"
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    rate: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    equipment: {
        type: String,
        required: true,
    },
    opening: {
        type: String,
        required: true,
    },
    closing: {
        type: String,
        required: true,
    },
    interval: {
        type: Number,
        required: true,
    },
    bookings: [
        {
            date: {
                type: String,
            },
            slots: [
                {
                    type: String,
                }
            ]
        }
    ]
}, { timestamps: true });

// statics
padSchema.statics.instanceOfIPad = (param: any): param is IPad => {
    return param.opening !== undefined
};

const Pads = mongoose.model<IPad, IPadModel>("Pads", padSchema);
export default Pads;

