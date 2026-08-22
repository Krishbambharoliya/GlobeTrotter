import os
import requests
import logging

logger = logging.getLogger(__name__)

def send_sms_otp(phone_number, otp):
    """
    Sends an OTP to the given phone number.
    Supports Fast2SMS and Twilio.
    """
    phone_number = str(phone_number).strip().replace(" ", "")
    
    # Try Fast2SMS first if configured
    fast2sms_api_key = os.environ.get("FAST2SMS_API_KEY")
    if not fast2sms_api_key:
        from django.conf import settings
        fast2sms_api_key = getattr(settings, "FAST2SMS_API_KEY", None)
        
    if fast2sms_api_key:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            clean_num = phone_number
            if clean_num.startswith("+91"):
                clean_num = clean_num[3:]
            elif clean_num.startswith("91") and len(clean_num) == 12:
                clean_num = clean_num[2:]
                
            payload = {
                "route": "otp",
                "variables_values": otp,
                "numbers": clean_num
            }
            headers = {
                "authorization": fast2sms_api_key,
                "Content-Type": "application/json"
            }
            response = requests.post(url, json=payload, headers=headers, timeout=5)
            res_json = response.json()
            if res_json.get("return") is True:
                logger.info(f"OTP SMS sent successfully to {phone_number} via Fast2SMS.")
                return True, "OTP sent via Fast2SMS successfully!"
            else:
                logger.error(f"Fast2SMS error: {res_json}")
                return False, f"Fast2SMS error: {res_json.get('message')}"
        except Exception as e:
            logger.error(f"Failed to send SMS via Fast2SMS: {e}")
            
    # Try Twilio if configured
    twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    twilio_token = os.environ.get("TWILIO_AUTH_TOKEN")
    twilio_from = os.environ.get("TWILIO_FROM_NUMBER")
    
    if not twilio_sid:
        from django.conf import settings
        twilio_sid = getattr(settings, "TWILIO_ACCOUNT_SID", None)
        twilio_token = getattr(settings, "TWILIO_AUTH_TOKEN", None)
        twilio_from = getattr(settings, "TWILIO_FROM_NUMBER", None)
        
    if twilio_sid and twilio_token and twilio_from:
        try:
            twilio_to = phone_number
            if not twilio_to.startswith("+"):
                if len(twilio_to) == 10:
                    twilio_to = "+91" + twilio_to
                else:
                    twilio_to = "+" + twilio_to
                    
            try:
                from twilio.rest import Client
                client = Client(twilio_sid, twilio_token)
                client.messages.create(
                    body=f"Your GlobeTrotter password reset OTP is {otp}. It is valid for 10 minutes.",
                    from_=twilio_from,
                    to=twilio_to
                )
                logger.info(f"OTP SMS sent successfully to {twilio_to} via Twilio SDK.")
                return True, "OTP sent via Twilio successfully!"
            except ImportError:
                # Direct REST API request if twilio SDK is not installed
                auth = (twilio_sid, twilio_token)
                url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
                data = {
                    "Body": f"Your GlobeTrotter password reset OTP is {otp}. It is valid for 10 minutes.",
                    "From": twilio_from,
                    "To": twilio_to
                }
                res = requests.post(url, data=data, auth=auth, timeout=5)
                if res.status_code in [200, 201]:
                    logger.info(f"OTP SMS sent successfully to {twilio_to} via Twilio REST API.")
                    return True, "OTP sent via Twilio successfully!"
                else:
                    logger.error(f"Twilio API error: {res.text}")
                    return False, f"Twilio API error: {res.status_code}"
        except Exception as e:
            logger.error(f"Failed to send SMS via Twilio: {e}")
            
    # Default fallback
    print(f"\n========================================")
    print(f"SMS SENT TO: {phone_number}")
    print(f"MESSAGE: Your GlobeTrotter password reset OTP is {otp}")
    print(f"========================================\n")
    logger.warning(f"SMS credentials not found. OTP {otp} printed to console.")
    return False, "SMS gateway credentials not found. OTP printed to terminal."
