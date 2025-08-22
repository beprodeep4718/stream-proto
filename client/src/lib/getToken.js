import axios from "axios";


export const getToken = async (userId) => {
  const res = await axios.post("https://stream-proto.onrender.com/token", { userId });
  return res.data.token;
};
