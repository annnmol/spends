package expo.modules.smsmodule

import android.Manifest
import android.content.ComponentName
import android.content.ContentResolver
import android.content.Context
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Telephony
import expo.modules.interfaces.permissions.Permissions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicBoolean
import org.json.JSONArray

class SmsModule : Module() {

    private var receiver: SmsBroadcastReceiver? = null
    private val isListening = AtomicBoolean(false)
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun definition() = ModuleDefinition {
        Name("SmsModule")

        Events("onSmsReceived")

        OnCreate {
            SmsProcessor.register(this@SmsModule)
        }

        AsyncFunction("requestSmsPermission") { promise: Promise ->
            Permissions.askForPermissionsWithPermissionsManager(
                appContext.permissions,
                promise,
                Manifest.permission.READ_SMS,
                Manifest.permission.RECEIVE_SMS
            )
        }

        AsyncFunction("getSmsPermissionStatus") { promise: Promise ->
            Permissions.getPermissionsWithPermissionsManager(
                appContext.permissions,
                promise,
                Manifest.permission.READ_SMS,
                Manifest.permission.RECEIVE_SMS
            )
        }

        AsyncFunction("getRecentSms") { limit: Int ->
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            val safeLimit = limit.coerceIn(1, 200)
            querySms(
                context.contentResolver,
                selection = null,
                selectionArgs = null,
                sortOrder = "${Telephony.Sms.Inbox.DATE} DESC LIMIT $safeLimit"
            )
        }

        AsyncFunction("getAllSms") {
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            querySms(
                context.contentResolver,
                selection = null,
                selectionArgs = null,
                sortOrder = "${Telephony.Sms.Inbox.DATE} DESC"
            )
        }

        AsyncFunction("getSmsAfterDate") { timestamp: Long ->
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            querySms(
                context.contentResolver,
                selection = "${Telephony.Sms.Inbox.DATE} >= ?",
                selectionArgs = arrayOf(timestamp.toString()),
                sortOrder = "${Telephony.Sms.Inbox.DATE} DESC"
            )
        }

        AsyncFunction("startListening") {
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            if (isListening.compareAndSet(false, true)) {
                val recv = SmsBroadcastReceiver()
                val filter = IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    context.registerReceiver(recv, filter, Context.RECEIVER_NOT_EXPORTED)
                } else {
                    context.registerReceiver(recv, filter)
                }
                receiver = recv
            }
        }

        AsyncFunction("stopListening") {
            val context = appContext.reactContext
            if (isListening.compareAndSet(true, false)) {
                receiver?.let { context?.unregisterReceiver(it) }
                receiver = null
            }
        }

        // ── Background (killed-state) support ────────────────────────────────

        AsyncFunction("enableBackgroundListening") {
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            val component = ComponentName(context, SmsBackgroundReceiver::class.java)
            context.packageManager.setComponentEnabledSetting(
                component,
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            )
        }

        AsyncFunction("disableBackgroundListening") {
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            val component = ComponentName(context, SmsBackgroundReceiver::class.java)
            context.packageManager.setComponentEnabledSetting(
                component,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
        }

        AsyncFunction("getPendingBackgroundSms") {
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            val prefs = context.getSharedPreferences(
                SmsBackgroundReceiver.PREFS_NAME, Context.MODE_PRIVATE
            )
            val json = prefs.getString(SmsBackgroundReceiver.KEY_QUEUE, "[]") ?: "[]"
            val array = try { JSONArray(json) } catch (e: Exception) { JSONArray() }
            val result = mutableListOf<Map<String, Any?>>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                result.add(
                    mapOf(
                        "id" to obj.getString("id"),
                        "sender" to obj.getString("sender"),
                        "body" to obj.getString("body"),
                        "timestamp" to obj.getLong("timestamp")
                    )
                )
            }
            result
        }

        AsyncFunction("clearPendingBackgroundSms") {
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            context.getSharedPreferences(
                SmsBackgroundReceiver.PREFS_NAME, Context.MODE_PRIVATE
            ).edit().remove(SmsBackgroundReceiver.KEY_QUEUE).apply()
        }

        // ── Testing utilities ─────────────────────────────────────────────────

        AsyncFunction("simulateIncomingSms") { sender: String, body: String ->
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            SmsProcessor.process(context, sender, body, System.currentTimeMillis())
        }

        AsyncFunction("scheduleSimulatedSms") { sender: String, body: String, delaySeconds: Int ->
            val context = appContext.reactContext
                ?: throw IllegalStateException("React context is no longer available")
            mainHandler.postDelayed({
                SmsProcessor.process(context, sender, body, System.currentTimeMillis())
            }, delaySeconds * 1000L)
        }

        OnDestroy {
            SmsProcessor.unregister()
            if (isListening.getAndSet(false)) {
                receiver?.let { appContext.reactContext?.unregisterReceiver(it) }
                receiver = null
            }
        }
    }

    internal fun emitSmsEvent(sender: String, body: String, timestamp: Long) {
        sendEvent(
            "onSmsReceived",
            mapOf(
                "id" to timestamp.toString(),
                "sender" to sender,
                "body" to body,
                "timestamp" to timestamp
            )
        )
    }

    private fun querySms(
        resolver: ContentResolver,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String
    ): List<Map<String, Any?>> {
        val projection = arrayOf(
            Telephony.Sms.Inbox._ID,
            Telephony.Sms.Inbox.ADDRESS,
            Telephony.Sms.Inbox.BODY,
            Telephony.Sms.Inbox.DATE
        )
        val messages = mutableListOf<Map<String, Any?>>()
        resolver.query(
            Telephony.Sms.Inbox.CONTENT_URI,
            projection,
            selection,
            selectionArgs,
            sortOrder
        )?.use { cursor ->
            val idIdx = cursor.getColumnIndexOrThrow(Telephony.Sms.Inbox._ID)
            val addrIdx = cursor.getColumnIndexOrThrow(Telephony.Sms.Inbox.ADDRESS)
            val bodyIdx = cursor.getColumnIndexOrThrow(Telephony.Sms.Inbox.BODY)
            val dateIdx = cursor.getColumnIndexOrThrow(Telephony.Sms.Inbox.DATE)
            while (cursor.moveToNext()) {
                messages.add(
                    mapOf(
                        "id" to cursor.getString(idIdx),
                        "sender" to (cursor.getString(addrIdx) ?: ""),
                        "body" to (cursor.getString(bodyIdx) ?: ""),
                        "timestamp" to cursor.getLong(dateIdx)
                    )
                )
            }
        }
        return messages
    }
}
