import { z } from "zod";

export const userAuthZod = z.object({
    email: z.string(),
    password: z.string(),
    phone: z.string().optional(),
    userType: z.string().optional(),
});

export const addressZod = z.object({
    address: z.string(),
    state: z.string(),
    city: z.string(),
    pincode: z.string()
});