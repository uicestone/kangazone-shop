const { VUE_APP_API_ENDPOINT, NODE_ENV } = process.env;

export const config = {
  IS_PROD: NODE_ENV == "production",
  NODE_ENV,
  VUE_APP_API_ENDPOINT,
  VENDERID: "26728"
};
