package expo.modules.smsmodule

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.lang.ref.WeakReference

internal object SmsProcessor {

    private var moduleRef: WeakReference<SmsModule>? = null

    fun register(module: SmsModule) {
        moduleRef = WeakReference(module)
    }

    fun unregister() {
        moduleRef = null
    }

    fun process(context: Context, sender: String, body: String, timestamp: Long) {
        saveToQueue(context, sender, body, timestamp)
        moduleRef?.get()?.emitSmsEvent(sender, body, timestamp)
    }

    private fun saveToQueue(context: Context, sender: String, body: String, timestamp: Long) {
        val prefs = context.getSharedPreferences(
            SmsBackgroundReceiver.PREFS_NAME, Context.MODE_PRIVATE
        )
        val current = prefs.getString(SmsBackgroundReceiver.KEY_QUEUE, "[]")
        val queue = try { JSONArray(current) } catch (e: Exception) { JSONArray() }
        queue.put(
            JSONObject().apply {
                put("id", timestamp.toString())
                put("sender", sender)
                put("body", body)
                put("timestamp", timestamp)
            }
        )
        prefs.edit().putString(SmsBackgroundReceiver.KEY_QUEUE, queue.toString()).apply()
    }
}
