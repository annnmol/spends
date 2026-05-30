import { EventEmitter, requireNativeModule } from "expo-modules-core";
import type { SmsMessage, SmsModuleAPI } from "./src/SmsModule.types";

const SmsModule = requireNativeModule<SmsModuleAPI>("SmsModule");
const emitter = new EventEmitter(SmsModule as any);

export function addSmsReceivedListener(listener: (message: SmsMessage) => void) {
  return emitter.addListener<SmsMessage>("onSmsReceived", listener);
}

export default SmsModule;
export type {
  SmsMessage,
  SmsPermissionResponse,
  SmsPermissionStatus,
  SmsModuleAPI,
} from "./src/SmsModule.types";
