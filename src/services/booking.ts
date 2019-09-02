import { axios } from "../utils/axios";
import { _ } from "../utils/lodash";

export type BookingType = "play" | "party";
export enum BookingStatus {
  PENDING
}

export type BookingFindArgs = QueryArgs & {
  type: BookingType;
  date: string;
  status: string;
  due: boolean;
};

export interface QueryArgs {
  skip: number;
  limit: number;
}

export const findBookings = (args: BookingFindArgs) => {
  const params = _.omitBy(args, _.isNil);
  return axios.request({ url: "/api/booking", params });
};
