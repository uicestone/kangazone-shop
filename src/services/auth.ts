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
