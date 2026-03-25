import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { ZodError, ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodSchema) {}

    transform(value: unknown) {
        const result = this.schema.safeParse(value);

        if (result.success) {
            return result.data;
        }

        throw new BadRequestException({
            message: "Validation failed",
            errors: this.formatZodError(result.error),
        });
    }

    private formatZodError(error: ZodError) {
        return error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }));
    }
}
