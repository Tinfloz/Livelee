import mongoose from "mongoose";

export interface IOwner {
    _id: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId
    pad: Array<mongoose.Schema.Types.ObjectId>,
    bookings: Array<mongoose.Schema.Types.ObjectId>
}

export interface IOwnerModel extends mongoose.Model<IOwner> {
    instanceOfIOwner: (param: any) => param is IOwner
}

const ownerSchema = new mongoose.Schema<IOwner, IOwnerModel>({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users"
    },
    pad: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Rooms"
        }
    ],
    bookings: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Bookings"
        }
    ]
}, { timestamps: true })

// static method
ownerSchema.statics.instanceOfIOwner = (param: any): param is IOwner => {
    return param.userId !== undefined
};

const Owners = mongoose.model<IOwner, IOwnerModel>("Owners", ownerSchema);

export default Owners;