import { axios } from "../utils/axios";

export const findUser = ({ keyword }) => axios.request({ url: "/api/user", params: { keyword } });
export const getUser = ({ id }) => axios.request({ url: `/api/user/${id}` });
