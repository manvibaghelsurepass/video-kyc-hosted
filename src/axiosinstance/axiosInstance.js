import axios from "axios";

export  const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_CONSOLE_BASE_URL, withCredentials: true,

});

export const videoKycAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SUPERFLOW_BASE_URL,
});


