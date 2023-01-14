import { z } from "zod";

export const bookingZod = z.object({
    date: z.string(),
    slots: z.array(z.string())
});

export const verifyPaymentZod = z.object({
    orderCreationId: z.string(),
    razorpayPaymentId: z.string(),
    razorpayOrderId: z.string(),
    razorpaySignature: z.string(),
});