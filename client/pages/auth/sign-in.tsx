import axios from "axios";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

const SignInPage = () => {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setSigningIn(true);

    const formData = new FormData(ev.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    axios
      .post("http://127.0.0.1:8080/auth/sign-in", payload)
      .then((res) => {
        if (res.data.jwt) {
          localStorage.setItem("jwt", res.data.jwt);
          localStorage.setItem("id", res.data.user.id);
        }

        toast.success("Sign in successful! Redirecting to the Dashboard");
        router.push("/");
        setSigningIn(false);
      })
      .catch((err) => {
        toast.error("Sign in failed. Please try again.");
        setSigningIn(false);
      });
  };

  return (
    <div className={"w-full min-h-screen p-4 flex flex-col items-center justify-center gap-4 text-zinc-300 bg-zinc-900"}>
      <div className={"w-full max-w-md space-y-4"}>
        <h1 className={"text-4xl font-bold"}>Sign In</h1>

        <form onSubmit={handleSignIn} className={"space-y-2"}>
          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Email</label>
            <input type={"email"} name={"email"} className={"py-2 px-4 bg-zinc-800 rounded-md"} />
          </div>

          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Password</label>
            <input type={"password"} name={"password"} className={"py-2 px-4 bg-zinc-800 rounded-md"} />
          </div>

          <div className={"pt-2"}>
            <button disabled={signingIn} type={"submit"} className={"w-full p-4 font-semibold bg-indigo-500 rounded-md"}>
              {!signingIn ? "Sign in" : "Signing In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
