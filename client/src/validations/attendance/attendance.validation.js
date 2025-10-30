import { z } from "zod";

export const createClassNameSchema = z.object({
  className: z.enum(
    ["prep_1", "prep_2", "prep_3", "secondary_1", "secondary_2", "secondary_3"],
    {
      required_error: "Class name is required",
      invalid_type_error: "Invalid class name",
    }
  ),
});
