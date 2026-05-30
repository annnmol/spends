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
}
