import mongoose from "mongoose";

export interface ICustomer {
    _id: string,
    userId: mongoose.Schema.Types.ObjectId,
    address: string,
    city: string,
    state: string,
    pincode: string,
    latitude: number,
    longitude: number,
    bookings: Array<mongoose.Schema.Types.ObjectId>
}

interface ICustomerModel extends mongoose.Model<ICustomer> {
    instanceOfICustomer: (param: any) => param is ICustomer
}

const customerSchema = new mongoose.Schema<ICustomer, ICustomerModel>({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users"
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pincode: {
        type: String,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    bookings: [
        {
            type: mongoose.Types.ObjectId
        }
    ]
}, { timestamps: true })

// statics 
customerSchema.statics.instanceOfICustomer = (param: any): param is ICustomer => {
    return param.userId !== undefined
};

const Customers = mongoose.model<ICustomer, ICustomerModel>("Customers", customerSchema);
export default Customers;