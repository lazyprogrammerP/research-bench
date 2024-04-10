import { Idea } from "@prisma/client";
import { Request, Router } from "express";
import Prisma from "../../prisma";
import vdb from "../../utils/vdb";
import CreateIdeaRequestValidator, { CreateIdeaRequest } from "../../validators/idea/create-idea-request.validator";
import FeedRequestValidator, { FeedRequest } from "../../validators/idea/feed-request.validator";

const IdeaRouter = Router();

// Get Ideas For User Profile Route
IdeaRouter.get("/", async (req: Request<null, { ideas: Idea[] } | { error: "Unauthorized" }, null, { page: string }>, res) => {
  const userId = parseInt(req.decodedJWT?.id ?? "");
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const ideas = await Prisma.idea.findMany({
    where: {
      authorId: userId,
    },
    orderBy: { createdAt: "desc" },
    skip: parseInt(req.query.page ?? "0") * 15,
    take: 15,
  });

  return res.status(200).send({ ideas });
});

// Get Ideas For Feed Route
IdeaRouter.post("/feed", async (req: Request<null, { ideas: Idea[] } | { error: "Invalid Request Body" | "Unauthorized"; trace?: any }, FeedRequest, { page: string }>, res) => {
  const request = req.body;

  const validation = FeedRequestValidator.safeParse(request);
  if (!validation.success) {
    console.error(`Validation Error: ${validation.error}`);
    return res.status(400).send({ error: "Invalid Request Body", trace: validation.error });
  }

  const userId = parseInt(req.decodedJWT?.id ?? "");
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const ideas = await Prisma.idea.findMany({
    where: {
      keywords: request.filter.keywords?.length
        ? {
            some: {
              keyword: {
                in: request.filter.keywords,
              },
            },
          }
        : {},
    },
    include: {
      keywords: true,
      author: true,
    },
    orderBy: request.sort.by === "TIME" ? { createdAt: request.sort.order } : { usersInterested: { _count: request.sort.order } },
    skip: parseInt(req.query.page ?? "0") * 15,
    take: 15,
  });

  return res.status(200).send({ ideas });

  // TODO: add count of total ideas
});

// Get One Idea
IdeaRouter.get("/:id", async (req: Request<{ id: string }, { idea: Idea } | { error: "Unauthorized" | "Invalid Request" | "Idea not found" }, null, null>, res) => {
  const userId = parseInt(req.decodedJWT?.id ?? "");
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const ideaId = req.params.id;
  if (!ideaId) {
    return res.status(400).send({ error: "Invalid Request" });
  }

  const idea = await Prisma.idea.findUnique({
    where: { id: parseInt(ideaId), authorId: userId },
    include: { keywords: true, author: true, usersInterested: true },
  });

  if (!idea) {
    return res.status(404).send({ error: "Idea not found" });
  }

  return res.status(200).send({ idea });
});

// Create Idea Route
IdeaRouter.post("/", async (req: Request<null, { idea: Idea } | { error: "Invalid Request Body" | "Unauthorized"; trace?: any }, CreateIdeaRequest, null>, res) => {
  const request = req.body;

  const validation = CreateIdeaRequestValidator.safeParse(request);
  if (!validation.success) {
    console.error(`Validation Error: ${validation.error}`);
    return res.status(400).send({ error: "Invalid Request Body", trace: validation.error });
  }

  const userId = parseInt(req.decodedJWT?.id ?? "");
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const idea = await Prisma.idea.create({
    data: {
      title: request.title,
      abstract: request.abstract,
      keywords: {
        connectOrCreate: request.keywords.map((keyword) => ({
          where: { keyword },
          create: { keyword },
        })),
      },
      authorId: userId,
    },
    include: {
      keywords: true,
      author: true,
    },
  });

  await vdb.upsert(idea.id.toString(), idea.abstract);

  return res.status(201).send({ idea });
});

// Similar Ideas Route
IdeaRouter.get("/:id/similar", async (req: Request<{ id: string }, { ideas: Idea[] } | { error: "Unauthorized" | "Idea not found" }, null, null>, res) => {
  const userId = parseInt(req.decodedJWT?.id ?? "");
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const ideaId = req.params.id;

  const idea = await Prisma.idea.findUnique({
    where: { id: parseInt(ideaId), authorId: userId },
  });

  if (!idea) {
    return res.status(404).send({ error: "Idea not found" });
  }

  const similarIdeaMatches = await vdb.similar(idea.abstract);
  const similarIdeaIds = similarIdeaMatches.matches.map((match) => parseInt(match.id ?? "0"));

  let similarIdeas = await Prisma.idea.findMany({
    where: {
      id: {
        in: similarIdeaIds,
      },
    },
    include: {
      keywords: true,
      author: true,
    },
  });

  similarIdeas = similarIdeas.filter((similarIdea) => idea.id !== similarIdea.id);

  return res.status(200).send({ ideas: similarIdeas });
});

// Show Interest in Idea Route
IdeaRouter.post("/:id/interested", async (req: Request<{ id: string }, { idea: Idea } | { error: "Invalid Request" | "Idea not found" | "Unauthorized" }, null, null>, res) => {
  const ideaId = req.params.id;
  if (!ideaId) {
    return res.status(400).send({ error: "Invalid Request" });
  }

  const userId = parseInt(req.decodedJWT?.id ?? "");
  if (!userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  let idea = await Prisma.idea.findUnique({
    where: { id: parseInt(ideaId) },
  });

  if (!idea) {
    return res.status(404).send({ error: "Idea not found" });
  }

  idea = await Prisma.idea.update({
    where: { id: idea.id },
    data: {
      usersInterested: {
        connect: { id: userId },
      },
    },
  });

  return res.status(200).send({ idea });
});

// TODO: Update Idea Route

// TODO: Delete Idea Route

export default IdeaRouter;
