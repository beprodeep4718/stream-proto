import axios from "axios";


export const getToken = async (userId) => {
  const res = await axios.post("http://localhost:3001/token", { userId });
  return res.data.token;
};
