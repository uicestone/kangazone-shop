import { axios } from "../utils/axios";

export class User {
  id: string;
  login: string;
  role: string;
}
export const login = async ({ username, password }: { username: string; password: string }) =>
  axios.request<{ token: string; user: User }>({
    method: "POST",
    url: "/auth/login",
    data: { login: username, password }
  });

export const signup = async ({ username, gender, mobile, idCardNo }) =>
  axios.request({
    method: "POST",
    url: "/user",
    data: { name: username, gender, mobile, idCardNo }
  });

export const getAuthUser = async () =>
  axios.request<User>({
    url: "/auth/user"
  });

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};
