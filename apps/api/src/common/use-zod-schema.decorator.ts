import { UsePipes, applyDecorators } from "@nestjs/common";
import type { ZodSchema } from "zod";

import { ZodValidationPipe } from "./zod-validation.pipe";

export function UseZodSchema(schema: ZodSchema) {
    return applyDecorators(UsePipes(new ZodValidationPipe(schema)));
}
