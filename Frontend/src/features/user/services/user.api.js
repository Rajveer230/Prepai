import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
});

export const fetchProfileStats = async () => {
    const { data } = await API.get("/api/user/stats");
    return data;
};

export const changePassword = async (payload) => {
    const { data } = await API.put("/api/user/change-password", payload);
    return data;
};
