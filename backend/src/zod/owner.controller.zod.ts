import { z } from "zod";

export const createJamPadZod = z.object({
    name: z.string(),
    image: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    equipment: z.string(),
    opening: z.string(),
    closing: z.string(),
    interval: z.string(),
});

export const changeIntervalZod = z.object({
    interval: z.string()
});

export const timeChangeZod = z.object({
    opening: z.string().optional(),
    closing: z.string().optional()
});

export const changePadZod = z.object({
    image: z.string().optional(),
    name: z.string().optional(),
    equipment: z.string().optional()
});

export const addressChangeZod = z.object({
    address: z.string(),
    state: z.string(),
    city: z.string(),
    pincode: z.string()
});