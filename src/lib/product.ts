import { Platform } from "react-native";

//custom imports
import {
  default as logoDark,
  default as logoWhite,
} from "@root/assets/images/icon.png";

export type IProductIdentifier = "quickzi";

const identifier =
  (process.env.EXPO_PUBLIC_PRODUCT_NAME as IProductIdentifier) ?? "quickzi";
const productName = identifier?.charAt(0)?.toUpperCase() + identifier?.slice(1);

const productConfig = {
  name: productName,
  identifier: identifier,
  logoDark: logoDark,
  logoWhite: logoWhite,
  storeUrl:
    Platform.select({
      ios: `itms-apps://itunes.apple.com/app/com.anmoltanwar.${identifier}`,
      android: `market://details?id=com.anmoltanwar.${identifier}`,
    }) ?? "",
  storeReviewUrl:
    Platform.select({
      ios: `itms-apps://itunes.apple.com/app/com.anmoltanwar.${identifier}`,
      android: `market://details?id=com.anmoltanwar.${identifier}&showAllReviews=true`,
    }) ?? "",
  landingBaseUrl: `https://www.${identifier}.com`,
  supportEmail: "socialyt664@gmail.com",
};

export default productConfig;
