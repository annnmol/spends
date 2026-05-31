import { EventEmitter, requireNativeModule } from "expo-modules-core";
import type { SmsMessage, SmsModuleAPI } from "./src/SmsModule.types";

type SmsEvents = {
  onSmsReceived: (message: SmsMessage) => void;
};

const SmsModule = requireNativeModule<SmsModuleAPI>("SmsModule");
const emitter = new EventEmitter<SmsEvents>(SmsModule as any);

export function addSmsReceivedListener(listener: (message: SmsMessage) => void) {
  return emitter.addListener("onSmsReceived", listener);
}

export default SmsModule;
export type {
  SmsMessage,
  SmsPermissionResponse,
  SmsPermissionStatus,
  SmsModuleAPI,
} from "./src/SmsModule.types";
