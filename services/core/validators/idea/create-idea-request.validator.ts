import { z } from "zod";

const CreateIdeaRequestValidator = z.object({
  title: z.string(),
  abstract: z.string().max(2048),
  keywords: z.array(z.string()).max(10),
});

export type CreateIdeaRequest = z.infer<typeof CreateIdeaRequestValidator>;

export default CreateIdeaRequestValidator;
