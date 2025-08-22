import axios from "axios";


export const getToken = async (userId) => {
  try {
    const url =
      import.meta?.env?.VITE_API_URL ||
      (window.location.hostname === "localhost"
        ? "http://localhost:3001/token"
        : "https://stream-proto.onrender.com/token");
    const res = await axios.post(url, { userId });
    return res.data.token;
  } catch (err) {
    throw new Error("Token fetch failed");
  }
};
