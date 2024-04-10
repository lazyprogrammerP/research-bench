import axios from "axios";

const Server = axios.create({
  baseURL: "http://127.0.0.1:8080",
});

Server.interceptors.request.use((config) => {
  config["headers"]["Authorization"] = `Bearer ${localStorage.getItem("jwt")}`;
  return config;
});

Server.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response.status === 401 || err.response.status === 403) {
      localStorage.removeItem("jwt");
      window.location.href = "/auth/sign-in";
    }

    return Promise.reject(err);
  }
);

export default Server;
