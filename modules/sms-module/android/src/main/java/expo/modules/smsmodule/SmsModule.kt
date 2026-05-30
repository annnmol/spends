package expo.modules.smsmodule

import android.Manifest
import android.provider.Telephony
import expo.modules.interfaces.permissions.Permissions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SmsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmsModule")

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
      val projection = arrayOf(
        Telephony.Sms.Inbox._ID,
        Telephony.Sms.Inbox.ADDRESS,
        Telephony.Sms.Inbox.BODY,
        Telephony.Sms.Inbox.DATE
      )
      val sortOrder = "${Telephony.Sms.Inbox.DATE} DESC LIMIT $safeLimit"

      val messages = mutableListOf<Map<String, Any?>>()
      context.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        projection,
        null,
        null,
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
      messages
    }
  }
}
