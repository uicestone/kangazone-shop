import { axios } from "../utils/axios";
import { _ } from "../utils/lodash";
import { Payment } from "./payment";

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
export interface Booking {
  id: string;
  bandIds: string[];
  checkInAt: string;
  customer: any;
  date: string;
  hours: string;
  price: number;
  payments: Payment[];
  socksCount: number;
  membersCount: number;
  status: BookingStatus;
  type: BookingType;
  store: any;
}

export interface QueryArgs {
  skip: number;
  limit: number;
}

export const findBookings = (args: BookingFindArgs) => {
  const params = _.omitBy(args, _.isNil);
  return axios.request({ url: "/api/booking", params });
};

export const createBooking = ({ store, type, date, hours, checkInAt, membersCount, socksCount, code, useCredit, paymentGateway }) => {
  const data = _.omitBy({ store, type, date, hours, checkInAt, membersCount, socksCount, code }, _.isNil);
  const params = _.omitBy({ useCredit, paymentGateway }, _.isNil);
  return axios.request<Booking>({
    url: `/api/booking`,
    params,
    method: "POST",
    data
  });
};

export const getBookingPrice = ({ store, type, date, hours, checkInAt, membersCount, socksCount, code, useCredit, paymentGateway }) => {
  const data = _.omitBy({ store, type, date, hours, checkInAt, membersCount, socksCount, code }, _.isNil);
  return axios.request<Booking>({
    url: `/api/booking-price`,
    params: {
      useCredit,
      paymentGateway
    },
    method: "POST",
    data
  });
};

export const updateBooking = ({ id, bandIds, status }) => {
  const data = _.omitBy({ bandIds, status }, _.isNil);
  return axios.request<Booking>({ method: "PUT", url: `/api/booking/${id}`, data });
};
