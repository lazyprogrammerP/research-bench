import { z } from "zod";

const FeedRequestValidator = z.object({
  filter: z.object({ keywords: z.array(z.string()).max(10).optional() }),
  sort: z.object({ by: z.enum(["TIME", "POPULARITY"]), order: z.enum(["asc", "desc"]) }),
});

export type FeedRequest = z.infer<typeof FeedRequestValidator>;

export default FeedRequestValidator;
