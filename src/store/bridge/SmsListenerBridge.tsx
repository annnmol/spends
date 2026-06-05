import { useEffect } from "react";

import { addSmsReceivedListener } from "../../../modules/sms-module";
import { useAccountsStore } from "../slices/accounts";
import { useMerchantsStore } from "../slices/merchants";
import { useSmsStore } from "../slices/sms";

/**
 * Null-rendering component that owns the SMS listener lifecycle.
 *
 * Placed once in _layout.tsx. Responsibilities:
 * 1. Boot — init both stores from SQLite on mount.
 * 2. Listener — subscribe/unsubscribe as `listening` flag changes.
 *
 * Using getState() in the listener callback means we always read the
 * latest accounts without needing a ref or re-subscribing on account changes.
 */
export function SmsListenerBridge() {
  const listening = useSmsStore((s) => s.listening);

  // Boot: accounts + merchants in parallel → then sms
  useEffect(() => {
    Promise.all([
      useAccountsStore.getState().init(),
      useMerchantsStore.getState().init(),
    ]).then(() => useSmsStore.getState().init());
  }, []);

  // Listener: wire up / tear down as listening state changes
  useEffect(() => {
    if (!listening) return;
    const sub = addSmsReceivedListener((msg) => {
      useSmsStore.getState().addMessage(msg);
    });
    return () => sub.remove();
  }, [listening]);

  return null;
}
