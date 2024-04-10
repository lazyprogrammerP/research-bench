import useUser from "@/hooks/useUser";
import Server from "@/lib/server";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const router = useRouter();
  const { id: userId } = router.query;

  const { userId: viewerId } = useUser();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<{
    id: number;
    name: string;
    email: string;
    role: "STUDENT" | "PROFESSOR";
    createdAt: string;
    updatedAt: string;
    ideas: {
      id: number;
      title: string;
      abstract: string;
      authorId: number;
      createdAt: string;
      updatedAt: string;
    }[];
    ideasOfInterest: {
      id: number;
      title: string;
      abstract: string;
      authorId: number;
      createdAt: string;
      updatedAt: string;
    }[];
  } | null>(null);

  const fetchProfile = async () => {
    setLoadingProfile(true);

    try {
      const profileResponse = await Server.get(`/user/${userId}/profile`);
      setProfile(profileResponse.data.user);
      setLoadingProfile(false);
    } catch (error) {
      toast.error("Failed to fetch profile. Please try again.");
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return (
    <div>
      <h1>User Profile</h1>

      {loadingProfile ? (
        <p>Loading Profile...</p>
      ) : (
        <>
          <div>
            <h2>Contact Information</h2>
            <p>Name: {profile?.name}</p>
            <p>Email: {profile?.email}</p>
            <p>Role: {profile?.role === "PROFESSOR" ? "Professor" : "Student"}</p>
            <p>User Since: {profile?.createdAt}</p>
          </div>

          <div>
            <h1>Ideas By User</h1>

            {profile?.ideas.map((idea) => (
              <div key={idea.id}>
                <h2>{idea.title}</h2>
                <p>{idea.abstract}</p>
                <p>Created At: {idea.createdAt}</p>
              </div>
            ))}
          </div>

          <div>
            <h1>Interests Shown By user</h1>

            {profile?.ideasOfInterest.map((idea) => (
              <div key={idea.id}>
                <h2>{idea.title}</h2>
                <p>{idea.abstract}</p>
                <p>Author: {idea.authorId}</p>
                <p>Created At: {idea.createdAt}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
