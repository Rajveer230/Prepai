import api from "../../../utils/api";

export const fetchProfileStats = async () => {
    const { data } = await api.get("/api/user/stats");
    return data;
};

export const changePassword = async (payload) => {
    const { data } = await api.put("/api/user/change-password", payload);
    return data;
};