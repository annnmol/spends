package expo.modules.smsmodule

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

class SmsBackgroundReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return

        // Group PDU parts by sender address
        val grouped = linkedMapOf<String, Pair<StringBuilder, Long>>()
        for (sms in messages) {
            val sender = sms.originatingAddress ?: continue
            val existing = grouped.getOrPut(sender) { Pair(StringBuilder(), sms.timestampMillis) }
            existing.first.append(sms.messageBody)
        }

        for ((sender, pair) in grouped) {
            SmsProcessor.process(context, sender, pair.first.toString(), pair.second)
        }
    }

    companion object {
        const val PREFS_NAME = "sms_module_prefs"
        const val KEY_QUEUE = "pending_sms_queue"
    }
}
