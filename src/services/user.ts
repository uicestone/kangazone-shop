import { axios } from "../utils/axios";
import { _ } from "../utils/lodash";

export const findUser = ({ keyword }) => axios.request({ url: "/user", params: { keyword } });
export const getUser = ({ id }) => axios.request({ url: `/user/${id}` });
export const updateUser = ({ id, cardNo, idCardNo, isForeigner, country }) => {
  const data = _.omitBy({ cardNo, idCardNo, isForeigner, country }, _.isNil);

  return axios.request({ method: "put", url: `/user/${id}`, data });
};

export const userDeposit = ({ id, depositLevel, paymentGateway }) => {
  const data = _.omitBy({ depositLevel: depositLevel.slug }, _.isNil);
  const params = _.omitBy({ paymentGateway }, _.isNil);
  return axios.request({ url: `/user-deposit/${id}`, method: "post", data, params });
};
