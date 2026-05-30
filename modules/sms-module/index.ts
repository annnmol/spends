import { requireNativeModule } from "expo-modules-core";
import type { SmsModuleAPI } from "./src/SmsModule.types";

const SmsModule = requireNativeModule<SmsModuleAPI>("SmsModule");

export default SmsModule;
export type {
  SmsMessage,
  SmsPermissionResponse,
  SmsPermissionStatus,
  SmsModuleAPI,
} from "./src/SmsModule.types";
