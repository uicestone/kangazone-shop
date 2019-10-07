import { EventEmitter } from "events";
import { axios } from "../utils/axios";
import { _ } from "../utils/lodash";
import { getBookingReceiptData } from "./booking";
import { config } from "../../config";

export const jsBridageBus = new EventEmitter();
//@ts-ignore
let $App = window.$App;

export interface Payment {
  id: string;
  title: string;
  amount: number;
  attach: string;
  customer: any;
  gateway: string;
  paid: boolean;
}

export interface PaymentParams {
  appType: string; //应用类型
  appId: string; //应用id
  transType: "00" | "09"; //交易类型
  amount: string; //交易金额
  orderId: string; // sass系统支付订单号
  businessId: string; // sass系统业务订单号
  orderInfo?: string; // 商品信息
  oriMisId?: string; // 原收银台流水号
  oriOrderId?: string; // 原sass系统支付订单号
  oriPlatformId?: string; // 原商户平台订单号
  payCode?: string; //支付码
  config?: {
    voiceBroadcast?: boolean; //是否播报语音
    processDisplay?: boolean; //是否显示UI界面
    resultDisplay?: boolean; //是否显示结果页
    printTicket?: boolean; //是否打印小票
    printIdType?: "mis" | "order" | "platform"; //打印订单类型
    remarks?: string; //备注
  };
}

export interface PaymentResponse {
  resultCode: string; //返回码
  resultMsg: string; //返回消息
  appType: string; //应用类型
  transType: string; //交易类型
  misId: string; //收银台流水号
  orderId: string; // sass系统支付订单号
  businessId: string; // sass系统业务订单号
  platformId: string; //第三方平台id
  platform: string; //支付方式
  amount: string; //交易金额
  amount1: string; //实付金额
  amount2: string; //优惠金额
  amount3: string; //商家优惠金额
  transDate: string; // 交易日期
  transTime: string; //凭证号
  batchNum: string; // 批次号
  referenceNum: string; //系统参考号
  cardNum: string; //卡号
  issuer: string; //发卡行
  acquirer: string; // 收单行
  operatorId: string; //操作员号
  cardType: string; //卡类型
  accountType: string; //账户类型
  model: string; //机型
  version: string; //版本
  terminalId: string; //终端号
  merchantId: string; //商户号
}

export const sendPaymentToSunmi = async (args: PaymentParams): Promise<PaymentResponse> =>
  new Promise((resolve, reject) => {
    try {
      jsBridageBus.once("javaCall", data => {
        resolve(data);
      });
      args.amount = (Number(args.amount) * 100).toString();
      let params = {
        appType: "01",
        appId: "com.kangazone.shop",
        transType: "00",
        ...args
      };
      //@ts-ignore
      $App.jsCallAndroid(JSON.stringify(params));
    } catch (error) {
      reject(error);
    }
  });
export const refundPaymentToSunmi = async (args: PaymentParams): Promise<PaymentResponse> =>
  new Promise((resolve, reject) => {
    try {
      jsBridageBus.once("javaCall", data => {
        resolve(data);
      });
      args.amount = Math.round(Math.abs(Number(args.amount)) * 100).toString();
      let params = {
        appType: "01",
        appId: "com.kangazone.shop",
        transType: "09",
        ...args
      };
      //@ts-ignore
      $App.jsCallAndroid(JSON.stringify(params));
    } catch (error) {
      reject(error);
    }
  });

export const updatePayment = async ({ id, paid }) => {
  const data = _.omitBy({ paid, status }, _.isNil);

  return axios.request({ url: `/payment/${id}`, method: "PUT", data });
};

export const openDrawer = () => {
  try {
    $App.jsOpenDrawer();
  } catch (error) {
    if (config.IS_PROD) {
      throw new Error(error);
    }
  }
};

export const bookingPrint = async ({ id }) => {
  try {
    const { data: receiptData } = await getBookingReceiptData({ id });
    $App.jsPrint(config.VENDERID, receiptData);
  } catch (error) {
    if (config.IS_PROD) {
      throw new Error(error);
    }
  }
};

export const jsGetAllUSBDevices = () => {
  try {
    $App.jsGetAllUSBDevices();
  } catch (error) {
    if (config.IS_PROD) {
      throw new Error(error);
    }
  }
};
