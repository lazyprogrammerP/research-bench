import useUser from "@/hooks/useUser";
import Server from "@/lib/server";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function Home() {
  const { userId } = useUser();

  const [loadingFeed, setLoadingFeed] = useState(true);
  const [creatingIdea, setCreatingIdea] = useState(false);
  const [showingInterest, setShowingInterest] = useState<number | null>(null);

  const [feed, setFeed] = useState<
    Array<{
      id: number;
      title: string;
      abstract: string;
      authorId: number;
      createdAt: string;
      updatedAt: string;
      keywords: {
        id: number;
        keyword: string;
      }[];
      author: {
        id: number;
        name: string;
        email: string;
        role: "STUDENT" | "PROFESSOR";
        createdAt: string;
        updatedAt: string;
      };
    }>
  >([]);

  const fetchFeed = async () => {
    setLoadingFeed(true);

    try {
      const feedResponse = await Server.post("/idea/feed", {
        filter: { keywords: [] },
        sort: { by: "TIME", order: "desc" },
      });

      setFeed(feedResponse.data.ideas);
      setLoadingFeed(false);
    } catch (error) {
      toast.error("Failed to fetch feed. Please try again.");
      setLoadingFeed(false);
    }
  };

  const handleCreateIdea = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setCreatingIdea(true);

    const formData = new FormData(ev.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const createFeedResponse = await Server.post("/idea", {
        ...payload,
        keywords: payload["keywords"].toString()?.split(", "),
      });
      setFeed((prev) => [createFeedResponse.data.idea, ...prev]);

      toast.success("Idea created successfully!");
      setCreatingIdea(false);
    } catch (error) {
      toast.error("Failed to create idea. Please try again.");
      setCreatingIdea(false);
    }
  };

  const showInterest = (ideaId: number) => async () => {
    setShowingInterest(ideaId);

    try {
      await Server.post(`/idea/${ideaId}/interested`);
      toast.success("Interest shown successfully!");
      setShowingInterest(null);
    } catch (error) {
      toast.error("Failed to show interest. Please try again.");
      setShowingInterest(null);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <main className={`w-full min-h-screen p-8 flex gap-8 text-zinc-300 bg-zinc-900`}>
      <div className={"w-1/3 max-w-md space-y-4"}>
        <h1 className={"text-4xl font-bold"}>New Idea</h1>

        <form onSubmit={handleCreateIdea} className={"space-y-2"}>
          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Title</label>
            <input type={"text"} name={"title"} className={"py-2 px-4 bg-zinc-800 rounded-md"} />
          </div>

          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Abstract</label>
            <textarea name={"abstract"} className={"py-2 px-4 bg-zinc-800 rounded-md"}></textarea>
          </div>

          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Keywords</label>
            <input type={"text"} name={"keywords"} className={"py-2 px-4 bg-zinc-800 rounded-md"} />
          </div>

          <button disabled={creatingIdea} type={"submit"}>
            {creatingIdea ? "Submitting" : "Submit"}
          </button>
        </form>
      </div>

      <div className={"flex-1 space-y-4"}>
        <h1 className={"text-4xl font-bold"}>My Feed</h1>
        {loadingFeed ? (
          <p>Loading Feed...</p>
        ) : (
          feed.map((feedItem) => {
            return (
              <div key={feedItem.id} className={"w-full p-4 space-y-2 bg-zinc-800/50 rounded-md"}>
                <h2 className={"text-2xl font-semibold"}>{feedItem.authorId === userId ? <Link href={`/idea/${feedItem.id}`}>{feedItem.title}</Link> : feedItem.title}</h2>

                <p>{feedItem.abstract}</p>

                <p>
                  Authored by{" "}
                  <Link href={`/profile/${feedItem.author.id}`} className={"underline"}>
                    {feedItem.author.name}
                  </Link>{" "}
                  on {new Date(feedItem.createdAt).toLocaleDateString()}
                </p>

                <p>Keywords:</p>
                <div className={"flex flex-wrap items-center gap-2"}>
                  {feedItem.keywords.map(({ id, keyword }) => {
                    return (
                      <span key={id} className={"p-2 text-sm border-2 bg-zinc-800 rounded-full"}>
                        {keyword}
                      </span>
                    );
                  })}
                </div>

                <div className={"pt-2"}>
                  <button className={"py-2 px-4 text-sm font-semibold bg-indigo-500 rounded-full"} onClick={showInterest(feedItem.id)}>
                    {showingInterest === feedItem.id ? "Showing Interest" : "I'm Interested"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
