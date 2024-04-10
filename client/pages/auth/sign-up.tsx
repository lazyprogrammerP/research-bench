import axios from "axios";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

const SignUpPage = () => {
  const router = useRouter();
  const [signingUp, setSigningUp] = useState(false);

  const handleSignUp = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setSigningUp(true);

    const formData = new FormData(ev.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    axios
      .post("http://127.0.0.1:8080/auth/sign-up", payload)
      .then((res) => {
        toast.success("Sign up successful! Please sign in to continue.");
        router.push("/auth/sign-in");
        setSigningUp(false);
      })
      .catch((err) => {
        toast.error("Sign up failed. Please try again.");
        setSigningUp(false);
      });
  };

  return (
    <div className={"w-full min-h-screen p-4 flex flex-col items-center justify-center gap-4 text-zinc-300 bg-zinc-900"}>
      <div className={"w-full max-w-md space-y-4"}>
        <h1 className={"text-4xl font-bold"}>Sign Up</h1>

        <form onSubmit={handleSignUp} className={"space-y-2"}>
          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Name</label>
            <input type={"text"} name={"name"} className={"py-2 px-4 bg-zinc-800 rounded-md"} />
          </div>

          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Email</label>
            <input type={"email"} name={"email"} className={"py-2 px-4 bg-zinc-800 rounded-md"} />
          </div>

          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Password</label>
            <input type={"password"} name={"password"} className={"py-2 px-4 bg-zinc-800 rounded-md"} />
          </div>

          <div className={"w-full flex flex-col gap-1"}>
            <label className={"text-sm font-semibold"}>Role</label>
            <select name={"role"} className={"py-2 px-4 bg-zinc-800 rounded-md"}>
              <option value={"PROFESSOR"}>Professor</option>
              <option value={"STUDENT"}>Student</option>
            </select>
          </div>

          <div className={"pt-2"}>
            <button disabled={signingUp} type={"submit"} className={"w-full p-4 font-semibold bg-indigo-500 rounded-md"}>
              {!signingUp ? "Sign Up" : "Signing Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
