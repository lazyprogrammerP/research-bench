import useUser from "@/hooks/useUser";
import Server from "@/lib/server";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const IdeaPage = () => {
  const router = useRouter();
  const { id: ideaId } = router.query;

  const { userId } = useUser();

  const [fetchingIdea, setFetchingIdea] = useState(true);
  const [idea, setIdea] = useState<{
    id: number;
    title: string;
    abstract: string;
    authorId: number;
    createdAt: string;
    updatedAt: string;
    keywords: { id: number; keyword: string }[];
    author: {
      id: number;
      name: string;
      email: string;
      role: "STUDENT" | "PROFESSOR";
      createdAt: string;
      updatedAt: string;
    };
    usersInterested: {
      id: number;
      name: string;
      email: string;
      role: "STUDENT" | "PROFESSOR";
      createdAt: string;
      updatedAt: string;
    }[];
  } | null>(null);

  const [fetchingSimilarIdeas, setFetchingSimilarIdeas] = useState(true);
  const [similarIdeas, setSimilarIdeas] = useState<
    {
      id: number;
      title: string;
      abstract: string;
      authorId: number;
      createdAt: string;
      updatedAt: string;
      keywords: { id: number; keyword: string }[];
      author: {
        id: number;
        name: string;
        email: string;
        role: "STUDENT" | "PROFESSOR";
        createdAt: string;
        updatedAt: string;
      };
    }[]
  >([]);

  const fetchIdeaById = async () => {
    setFetchingIdea(true);

    try {
      const ideaResponse = await Server.get(`/idea/${ideaId}`);
      setIdea(ideaResponse.data.idea);
      setFetchingIdea(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch idea. Please try again.");
      setFetchingIdea(false);
    }
  };

  const fetchSimilarIdeas = async () => {
    setFetchingSimilarIdeas(true);

    try {
      const similarIdeasResponse = await Server.get(`/idea/${ideaId}/similar`);
      setSimilarIdeas(similarIdeasResponse.data.ideas);
      setFetchingSimilarIdeas(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch similar ideas. Please try again.");
      setFetchingSimilarIdeas(false);
    }
  };

  useEffect(() => {
    if (ideaId) {
      fetchIdeaById();
      fetchSimilarIdeas();
    }
  }, [ideaId]);

  return (
    <div className={`w-full min-h-screen p-8 space-y-8 text-zinc-300 bg-zinc-900`}>
      <div className={`space-y-4`}>
        <h1 className={"text-4xl font-bold"}>Detailed Idea View</h1>
        {fetchingIdea ? (
          <p>Loading Idea...</p>
        ) : (
          <div key={idea?.id} className={"w-full p-4 space-y-2 bg-zinc-800/50 rounded-md"}>
            <h2 className={"text-2xl font-semibold"}>{idea?.authorId === userId ? <Link href={`/idea/${idea?.id}`}>{idea?.title}</Link> : idea?.title}</h2>

            <p>{idea?.abstract}</p>

            <p>
              Authored by{" "}
              <Link href={`/profile/${idea?.author.id}`} className={"underline"}>
                {idea?.author.name}
              </Link>{" "}
              on {new Date(idea?.createdAt ?? "0").toLocaleDateString()}
            </p>

            <p>Keywords:</p>
            <div className={"flex flex-wrap items-center gap-2"}>
              {idea?.keywords.map(({ id, keyword }) => {
                return (
                  <span key={id} className={"p-2 text-sm border-2 bg-zinc-800 rounded-full"}>
                    {keyword}
                  </span>
                );
              })}
            </div>

            {/* <div className={"pt-2"}>
              <button className={"py-2 px-4 text-sm font-semibold bg-indigo-500 rounded-full"} onClick={showInterest(feedItem.id)}>
                {showingInterest === feedItem.id ? "Showing Interest" : "I'm Interested"}
              </button>
            </div> */}
          </div>
        )}
      </div>

      <div>
        <h1 className={"text-4xl font-bold"}>Similar Ideas</h1>

        {fetchingSimilarIdeas ? (
          <p>Loading Similar Ideas...</p>
        ) : (
          similarIdeas.map((similarIdea) => (
            <div key={similarIdea?.id} className={"w-full p-4 space-y-2 bg-zinc-800/50 rounded-md"}>
              <h2 className={"text-2xl font-semibold"}>{similarIdea?.authorId === userId ? <Link href={`/idea/${similarIdea?.id}`}>{similarIdea?.title}</Link> : similarIdea?.title}</h2>

              <p>{similarIdea?.abstract}</p>

              <p>
                Authored by{" "}
                <Link href={`/profile/${similarIdea?.author.id}`} className={"underline"}>
                  {similarIdea?.author.name}
                </Link>{" "}
                on {new Date(similarIdea?.createdAt ?? "0").toLocaleDateString()}
              </p>

              <p>Keywords:</p>
              <div className={"flex flex-wrap items-center gap-2"}>
                {idea?.keywords.map(({ id, keyword }) => {
                  return (
                    <span key={id} className={"p-2 text-sm border-2 bg-zinc-800 rounded-full"}>
                      {keyword}
                    </span>
                  );
                })}
              </div>

              {/* <div className={"pt-2"}>
              <button className={"py-2 px-4 text-sm font-semibold bg-indigo-500 rounded-full"} onClick={showInterest(feedItem.id)}>
                {showingInterest === feedItem.id ? "Showing Interest" : "I'm Interested"}
              </button>
            </div> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IdeaPage;
