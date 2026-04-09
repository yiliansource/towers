import z from "zod";

import type { Axial, StackedAxial } from "../hexgrid/types.js";

export const AxialSchema = z.object({
    q: z.number().int(),
    r: z.number().int(),
}) satisfies z.ZodType<Axial>;

export const StackedAxialSchema = z.object({
    q: z.number().int(),
    r: z.number().int(),
    h: z.number().int(),
}) satisfies z.ZodType<StackedAxial>;
