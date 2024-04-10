import { Request, Router } from "express";
import Prisma from "../../prisma";

const UserRouter = Router();

UserRouter.get("/:id/profile", async (req: Request<{ id: string }, {}, null, null>, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).send({ error: "Invalid Request" });
  }

  const user = await Prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      ideas: {
        include: {
          keywords: true,
        },
      },
      ideasOfInterest: true,
    },
  });

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  return res.status(200).send({ user });
});

export default UserRouter;
