import { axios } from "../utils/axios";

export const findUser = ({ keyword }) => axios.request({ url: "/user", params: { keyword } });
export const getUser = ({ id }) => axios.request({ url: `/user/${id}` });
