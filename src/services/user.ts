import { axios } from "../utils/axios";

export const findUser = ({ keyword }) => axios.request({ url: "/api/user", params: { keyword } });
