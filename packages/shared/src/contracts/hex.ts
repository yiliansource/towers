import z from "zod";

import { Axial } from "../hexgrid/types.js";

export const AxialSchema = z.object({
    q: z.number().int(),
    r: z.number().int(),
}) satisfies z.ZodType<Axial>;
