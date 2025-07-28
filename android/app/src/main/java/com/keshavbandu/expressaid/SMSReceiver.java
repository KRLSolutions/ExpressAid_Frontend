package com.keshavbandu.expressaid;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SMSReceiver extends BroadcastReceiver {
    private static final String TAG = "SMSReceiver";
    private static ReactApplicationContext reactContext;

    public static void setReactContext(ReactApplicationContext context) {
        reactContext = context;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals("android.provider.Telephony.SMS_RECEIVED")) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                        String messageBody = smsMessage.getMessageBody();
                        String sender = smsMessage.getDisplayOriginatingAddress();
                        
                        Log.d(TAG, "SMS received from: " + sender);
                        Log.d(TAG, "SMS body: " + messageBody);
                        
                        // Extract OTP from SMS
                        String otp = extractOTPFromSMS(messageBody);
                        if (otp != null) {
                            Log.d(TAG, "OTP extracted: " + otp);
                            sendOTPToReact(otp);
                        }
                    }
                }
            }
        }
    }

    private String extractOTPFromSMS(String smsText) {
        // Common OTP patterns for ExpressAid
        String[] patterns = {
            "(\\d{6})", // 6-digit OTP
            "OTP[\\:\\s]*(\\d{6})", // OTP: 123456
            "code[\\:\\s]*(\\d{6})", // code: 123456
            "verification[\\:\\s]*(\\d{6})", // verification: 123456
            "(\\d{6})[^\\d]*$", // 6 digits at the end
            "verification code is\\:\\s*(\\d{6})", // "verification code is: 123456"
            "ExpressAid.*?(\\d{6})" // ExpressAid...123456
        };

        for (String pattern : patterns) {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern, java.util.regex.Pattern.CASE_INSENSITIVE);
            java.util.regex.Matcher m = p.matcher(smsText);
            if (m.find()) {
                return m.group(1);
            }
        }
        return null;
    }

    private void sendOTPToReact(String otp) {
        if (reactContext != null) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("SMS_OTP_RECEIVED", otp);
        }
    }
}