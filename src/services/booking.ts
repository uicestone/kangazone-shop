import { axios } from "../utils/axios";
import { _ } from "../utils/lodash";

export type BookingType = "play" | "party";
export type BookingStatus = "PENDING" | "BOOKED" | "IN_SERVICE" | "FINISHED" | "CANCELED";

export type BookingFindArgs = QueryArgs & {
  type?: BookingType;
  date?: string;
  status?: BookingStatus;
  due?: boolean;
  keyword?: string;
  customer?: string;
  store?: string;
};

export interface QueryArgs {
  skip: number;
  limit: number;
}

export const findBookings = (args: BookingFindArgs) => {
  const params = _.omitBy(args, _.isNil);
  return axios.request({ url: "/api/booking", params });
};
