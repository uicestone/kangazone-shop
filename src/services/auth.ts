import { axios } from "../utils/axios";

export class User {
  id: string;
  login: string;
  role: string;
}
export const login = ({ username, password }: { username: string; password: string }) =>
  axios.request<{ token: string; user: User }>({
    method: "POST",
    url: "/api/auth/login",
    data: { login: username, password }
  });

export const signup = ({ username, gender, mobile }) =>
  axios.request({
    method: "POST",
    url: "/api/user",
    data: { name: username, gender, mobile }
  });

export const getAuthUser = () =>
  axios.request<User>({
    url: "/api/auth/user"
  });

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};
