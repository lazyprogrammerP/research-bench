import { useEffect, useState } from "react";

const useUser = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    setUserId(parseInt(localStorage.getItem("id") || "") ?? null);
    setLoading(false);
  }, []);

  return {
    userId,
    loading,
  };
};

export default useUser;
