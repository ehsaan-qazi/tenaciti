"""
Email service — sends transactional emails via Resend.
Resend docs: https://resend.com/docs/send-with-python
"""

from typing import Optional
import resend

from app.config import settings


def _get_client() -> None:
    """Configure the Resend client with the API key from settings."""
    resend.api_key = settings.resend_api_key


async def send_password_reset_email(
    email: str,
    reset_link: str,
    expiry_hours: int = 1,
) -> bool:
    """
    Send a password reset email.
    Returns True if sent successfully, False otherwise.
    """
    _get_client()

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; margin: 0; padding: 40px 0;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">📚</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Koala</h1>
            </div>
            <!-- Body -->
            <div style="padding: 40px;">
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px; font-weight: 700;">Reset Your Password</h2>
                <p style="color: #555; margin: 0 0 24px;">You requested a password reset for your Koala account. Click the button below to set a new password.</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{reset_link}"
                       style="background: linear-gradient(135deg, #7c6af7 0%, #6b58f0 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 16px rgba(124,106,247,0.4);">
                        Reset Password →
                    </a>
                </div>
                <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Or copy this link into your browser:</p>
                <p style="word-break: break-all; color: #7c6af7; font-size: 12px; background: #f4f3ff; padding: 12px; border-radius: 6px; margin: 0 0 24px;">{reset_link}</p>
                <p style="color: #888; font-size: 13px; margin: 0;">
                    This link expires in <strong>{expiry_hours} hour{'s' if expiry_hours != 1 else ''}</strong>.
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>
            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #bbb; font-size: 12px; margin: 0;">Koala Study App · Helping you learn better</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        params: resend.Emails.SendParams = {
            "from": settings.mail_from,
            "to": [email],
            "subject": "Reset Your Koala Password",
            "html": html_content,
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"[Resend] Failed to send password reset email to {email}: {e}")
        return False


async def send_welcome_email(
    email: str,
    full_name: Optional[str] = None,
) -> bool:
    """
    Send a welcome email after successful registration.
    Returns True if sent successfully, False otherwise.
    """
    _get_client()

    name = full_name or "there"
    frontend_url = settings.cors_origin_list[0] if settings.cors_origin_list else "http://localhost:5173"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; margin: 0; padding: 40px 0;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">📚</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Koala</h1>
            </div>
            <!-- Body -->
            <div style="padding: 40px;">
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px; font-weight: 700;">Welcome to Koala, {name}! 🐨</h2>
                <p style="color: #555; margin: 0 0 16px;">
                    Thanks for creating an account. You're all set to start organizing your study materials,
                    tracking your progress, and achieving your learning goals.
                </p>
                <ul style="color: #555; padding-left: 20px; margin: 0 0 24px;">
                    <li style="margin-bottom: 8px;">🤖 Upload your syllabus — AI builds your study roadmap</li>
                    <li style="margin-bottom: 8px;">📝 Link notes to every topic and deadline</li>
                    <li style="margin-bottom: 8px;">📊 Track your confidence and learning trends</li>
                    <li>🔥 Earn streaks tied to real academic progress</li>
                </ul>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{frontend_url}"
                       style="background: linear-gradient(135deg, #7c6af7 0%, #6b58f0 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 16px rgba(124,106,247,0.4);">
                        Get Started →
                    </a>
                </div>
            </div>
            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #bbb; font-size: 12px; margin: 0;">Koala Study App · Helping you learn better</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        params: resend.Emails.SendParams = {
            "from": settings.mail_from,
            "to": [email],
            "subject": "Welcome to Koala! 🐨",
            "html": html_content,
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"[Resend] Failed to send welcome email to {email}: {e}")
        return False


async def send_verification_email(
    email: str,
    verification_link: str,
    expiry_hours: int = 24,
) -> bool:
    """
    Send an email verification link.
    Returns True if sent successfully, False otherwise.
    """
    _get_client()

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; margin: 0; padding: 40px 0;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">📚</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Koala</h1>
            </div>
            <div style="padding: 40px;">
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px; font-weight: 700;">Verify your email address</h2>
                <p style="color: #555; margin: 0 0 24px;">Thanks for signing up! Click the button below to verify your email address and activate your Koala account.</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{verification_link}"
                       style="background: linear-gradient(135deg, #7c6af7 0%, #6b58f0 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 16px rgba(124,106,247,0.4);">
                        Verify Email Address →
                    </a>
                </div>
                <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Or copy this link into your browser:</p>
                <p style="word-break: break-all; color: #7c6af7; font-size: 12px; background: #f4f3ff; padding: 12px; border-radius: 6px; margin: 0 0 24px;">{verification_link}</p>
                <p style="color: #888; font-size: 13px; margin: 0;">
                    This link expires in <strong>{expiry_hours} hours</strong>.
                    If you didn't create a Koala account, you can safely ignore this email.
                </p>
            </div>
            <div style="background: #f9f9f9; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #bbb; font-size: 12px; margin: 0;">Koala Study App · Helping you learn better</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        params: resend.Emails.SendParams = {
            "from": settings.mail_from,
            "to": [email],
            "subject": "Verify your Koala email address",
            "html": html_content,
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"[Resend] Failed to send verification email to {email}: {e}")
        return False