import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser {
    _id: mongoose.Schema.Types.ObjectId,
    email: string,
    password: string,
    userType: string,
    phone: number,
    resetToken: string | undefined,
    resetTokenExpires: Date | undefined
};

export interface IUserMethods {
    matchPassword: (password: string) => Promise<boolean>,
    getResetToken: () => string
}

interface IUserModel extends mongoose.Model<IUser, {}, IUserMethods> {
    instanceOfUser: (param: any) => param is IUser
}

const allUserSchema = new mongoose.Schema<IUser, IUserModel, IUserMethods>({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    userType: {
        type: String,
        required: true,
        enum: ["Customer", "Owner"]
    },
    phone: {
        type: Number,
        required: true
    },
    resetToken: {
        type: String
    },
    resetTokenExpires: {
        type: Date
    }
}, { timestamps: true })

// hash password
allUserSchema.pre("save", async function (next: any): Promise<void> {
    if (!this.isModified("password")) {
        return next();
    };
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// compare password
allUserSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

// get reset token 
allUserSchema.methods.getResetToken = function (): string {
    let token = crypto.randomBytes(20).toString("hex");
    this.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetTokenExpires = Date.now() + 10 * 60 * 1000;
    return token;
};

// static method
allUserSchema.statics.instanceOfUser = (param: any): param is IUser => {
    return param.email !== undefined;
};

const Users = mongoose.model<IUser, IUserModel>("Users", allUserSchema);
export default Users;