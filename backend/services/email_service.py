"""
import logging
Email service with Resend primary and console fallback
"""
import os
import requests
from typing import Optional


class EmailService:
    """Send emails via Resend API or console fallback"""

    def __init__(self):
        self.api_key = os.getenv('RESEND_API_KEY', '')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@hunt-x.app')
        self.enabled = bool(self.api_key)

    def send_email(self, to: str, subject: str, html: str, text: Optional[str] = None) -> bool:
        """Send an email. Returns True if sent successfully."""
        if not self.enabled:
            logging.getLogger("hunt-x").error(f"[EMAIL FALLBACK] To: {to}\nSubject: {subject}\n{'='*40}")
            if text:
                logging.getLogger("hunt-x").info(text)
            else:
                logging.getLogger("hunt-x").info(html)
            logging.getLogger("hunt-x").info('=' * 40)
            return True

        try:
            res = requests.post(
                'https://api.resend.com/emails',
                headers={'Authorization': f'Bearer {self.api_key}', 'Content-Type': 'application/json'},
                json={
                    'from': f'Hunt-X <{self.from_email}>',
                    'to': [to],
                    'subject': subject,
                    'html': html,
                    'text': text or '',
                },
                timeout=15,
            )
            res.raise_for_status()
            return True
        except Exception as e:
            logging.getLogger("hunt-x").error(f"Email send failed: {e}")
            return False

    def send_verification(self, to: str, code: str, name: Optional[str] = None) -> bool:
        """Send email verification code"""
        display_name = name or to.split('@')[0]
        subject = 'Verify your Hunt-X account'
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0B0B0F; color: #E8E8ED; border-radius: 8px;">
          <h2 style="margin: 0 0 16px; font-size: 20px;">Verify your email</h2>
          <p style="color: #8A8F98; margin: 0 0 24px;">Hi {display_name}, use the code below to verify your Hunt-X account.</p>
          <div style="background: #1A1A24; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 16px; text-align: center; font-size: 28px; font-weight: 600; letter-spacing: 4px; color: #3B82F6;">
            {code}
          </div>
          <p style="color: #5A5E66; font-size: 13px; margin: 16px 0 0;">This code expires in 24 hours. If you did not sign up for Hunt-X, ignore this email.</p>
        </div>
        """
        text = f"Hi {display_name},\n\nYour Hunt-X verification code is: {code}\n\nThis code expires in 24 hours."
        return self.send_email(to, subject, html, text)

    def send_password_reset(self, to: str, token: str, name: Optional[str] = None) -> bool:
        """Send password reset link"""
        display_name = name or to.split('@')[0]
        reset_url = f"https://hunt-x.app/auth/reset?token={token}"
        subject = 'Reset your Hunt-X password'
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0B0B0F; color: #E8E8ED; border-radius: 8px;">
          <h2 style="margin: 0 0 16px; font-size: 20px;">Reset your password</h2>
          <p style="color: #8A8F98; margin: 0 0 24px;">Hi {display_name}, click the link below to reset your Hunt-X password.</p>
          <a href="{reset_url}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Reset Password</a>
          <p style="color: #5A5E66; font-size: 13px; margin: 16px 0 0;">This link expires in 24 hours. If you did not request a reset, ignore this email.</p>
        </div>
        """
        text = f"Hi {display_name},\n\nReset your password: {reset_url}\n\nThis link expires in 24 hours."
        return self.send_email(to, subject, html, text)


email_service = EmailService()
