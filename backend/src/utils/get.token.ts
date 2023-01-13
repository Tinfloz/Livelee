import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const getAccessToken = (id: mongoose.Schema.Types.ObjectId): string => {
    return jwt.sign({ id }, process.env.JWT_SIGNATURE!, {
        expiresIn: "5d"
    })
}