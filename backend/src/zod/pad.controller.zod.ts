import { z } from "zod";

export const dateBookingZod = z.object({
    date: z.string()
});