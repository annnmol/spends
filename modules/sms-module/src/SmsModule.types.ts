export type SmsMessage = {
  id: string;
  sender: string;
  body: string;
  timestamp: number;
};

export type SmsPermissionStatus = "granted" | "denied" | "undetermined";

export type SmsPermissionResponse = {
  status: SmsPermissionStatus;
  granted: boolean;
  canAskAgain: boolean;
};

export interface SmsModuleAPI {
  requestSmsPermission(): Promise<SmsPermissionResponse>;
  getSmsPermissionStatus(): Promise<SmsPermissionResponse>;
  getRecentSms(limit: number): Promise<SmsMessage[]>;
  getAllSms(): Promise<SmsMessage[]>;
  getSmsAfterDate(timestamp: number): Promise<SmsMessage[]>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  enableBackgroundListening(): Promise<void>;
  disableBackgroundListening(): Promise<void>;
  getPendingBackgroundSms(): Promise<SmsMessage[]>;
  clearPendingBackgroundSms(): Promise<void>;
  simulateIncomingSms(sender: string, body: string): Promise<void>;
  scheduleSimulatedSms(sender: string, body: string, delaySeconds: number): Promise<void>;
}
