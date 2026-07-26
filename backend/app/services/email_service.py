import asyncio
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

from fastapi import HTTPException, status

from app.core.config import settings


class EmailService:
    def _sender(self) -> str:
        return formataddr(
            (
                settings.SMTP_FROM_NAME,
                settings.SMTP_FROM_EMAIL,
            )
        )

    def _build_verification_email(
        self,
        recipient_email: str,
        recipient_name: str,
        otp: str,
    ) -> EmailMessage:
        message = EmailMessage()
        message["Subject"] = f"{otp} is your GoldenSweep verification code"
        message["From"] = self._sender()
        message["To"] = recipient_email

        message.set_content(
            f"""
Hello {recipient_name},

Welcome to GoldenSweep.

Your email verification code is:

{otp}

This code expires in {settings.OTP_EXPIRE_MINUTES} minutes.

Do not share this code with anyone.

If you did not create a GoldenSweep account, you can safely ignore this email.

GoldenSweep
Secure • Transparent • Player First
            """.strip()
        )

        message.add_alternative(
            self._verification_html(
                recipient_name=recipient_name,
                otp=otp,
            ),
            subtype="html",
        )

        return message

    def _build_password_reset_email(
        self,
        recipient_email: str,
        recipient_name: str,
        otp: str,
    ) -> EmailMessage:
        message = EmailMessage()
        message["Subject"] = f"{otp} is your GoldenSweep password reset code"
        message["From"] = self._sender()
        message["To"] = recipient_email

        message.set_content(
            f"""
Hello {recipient_name},

We received a request to reset your GoldenSweep password.

Your password reset code is:

{otp}

This code expires in {settings.OTP_EXPIRE_MINUTES} minutes.

Do not share this code with anyone.

If you did not request a password reset, you can safely ignore this email.

GoldenSweep
Secure • Transparent • Player First
            """.strip()
        )

        message.add_alternative(
            self._password_reset_html(
                recipient_name=recipient_name,
                otp=otp,
            ),
            subtype="html",
        )

        return message

    def _verification_html(
        self,
        recipient_name: str,
        otp: str,
    ) -> str:
        return self._email_template(
            eyebrow="GOLDENSWEEP",
            title="Verify your email",
            greeting=recipient_name,
            description=(
                "Welcome to GoldenSweep. Use the verification code below "
                "to activate your account."
            ),
            otp=otp,
            security_text=(
                "GoldenSweep will never ask you to share this code, "
                "your password, or full payment credentials."
            ),
            footer_text=(
                "If you did not create a GoldenSweep account, "
                "you can safely ignore this email."
            ),
        )

    def _password_reset_html(
        self,
        recipient_name: str,
        otp: str,
    ) -> str:
        return self._email_template(
            eyebrow="GOLDENSWEEP SECURITY",
            title="Reset your password",
            greeting=recipient_name,
            description=(
                "We received a request to reset your GoldenSweep password. "
                "Use the security code below to continue."
            ),
            otp=otp,
            security_text=(
                "Never share this reset code with anyone. GoldenSweep support "
                "will never ask for your password or verification codes."
            ),
            footer_text=(
                "If you did not request a password reset, "
                "you can safely ignore this email."
            ),
        )

    def _email_template(
        self,
        *,
        eyebrow: str,
        title: str,
        greeting: str,
        description: str,
        otp: str,
        security_text: str,
        footer_text: str,
    ) -> str:
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="
    margin:0;
    padding:0;
    background:#020309;
    font-family:Arial,Helvetica,sans-serif;
    color:#ffffff;
">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
    width:100%;
    background:#020309;
    padding:36px 12px;
">
<tr>
<td align="center">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
    max-width:620px;
    background:#080914;
    border:1px solid #5b4617;
    border-radius:24px;
    overflow:hidden;
">

<tr>
<td style="
    height:4px;
    background:#d8a62a;
"></td>
</tr>

<tr>
<td align="center" style="padding:42px 36px 18px;">
    <div style="
        font-size:12px;
        letter-spacing:4px;
        font-weight:700;
        color:#ffc83d;
        text-transform:uppercase;
    ">
        {eyebrow}
    </div>

    <h1 style="
        margin:16px 0 0;
        font-size:30px;
        line-height:1.2;
        color:#ffffff;
    ">
        {title}
    </h1>
</td>
</tr>

<tr>
<td style="padding:10px 40px 0;">
    <p style="
        margin:0;
        font-size:15px;
        line-height:1.8;
        color:#b9bac5;
    ">
        Hello {greeting},
    </p>

    <p style="
        margin:14px 0 0;
        font-size:15px;
        line-height:1.8;
        color:#b9bac5;
    ">
        {description}
    </p>
</td>
</tr>

<tr>
<td align="center" style="padding:30px;">
    <div style="
        display:inline-block;
        padding:20px 34px;
        background:#05060d;
        border:1px solid #8c6a21;
        border-radius:16px;
        font-size:36px;
        font-weight:900;
        letter-spacing:10px;
        color:#ffd45d;
    ">
        {otp}
    </div>

    <p style="
        margin:16px 0 0;
        color:#8f9099;
        font-size:12px;
    ">
        This code expires in
        <strong style="color:#d9b451;">
            {settings.OTP_EXPIRE_MINUTES} minutes
        </strong>.
    </p>
</td>
</tr>

<tr>
<td style="padding:0 40px 30px;">
    <div style="
        background:#0d0c12;
        border:1px solid #332b16;
        border-radius:14px;
        padding:16px;
    ">
        <p style="
            margin:0;
            font-size:13px;
            line-height:1.7;
            color:#aaaab3;
        ">
            <strong style="color:#e0b94d;">
                Security notice:
            </strong>
            {security_text}
        </p>
    </div>
</td>
</tr>

<tr>
<td align="center" style="
    border-top:1px solid #1c1d24;
    padding:22px 30px 30px;
">
    <p style="
        margin:0;
        font-size:11px;
        color:#666873;
        line-height:1.7;
    ">
        {footer_text}
    </p>

    <p style="
        margin:10px 0 0;
        font-size:11px;
        color:#555762;
    ">
        © GoldenSweep • Secure • Transparent • Player First
    </p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>
        """

    def _send_sync(
        self,
        message: EmailMessage,
    ) -> None:
        context = ssl.create_default_context()

        if settings.SMTP_USE_SSL:
            with smtplib.SMTP_SSL(
                settings.SMTP_HOST,
                settings.SMTP_PORT,
                timeout=settings.SMTP_TIMEOUT_SECONDS,
                context=context,
            ) as smtp:
                self._authenticate_and_send(
                    smtp,
                    message,
                )
            return

        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=settings.SMTP_TIMEOUT_SECONDS,
        ) as smtp:
            smtp.ehlo()

            if settings.SMTP_USE_TLS:
                smtp.starttls(
                    context=context
                )
                smtp.ehlo()

            self._authenticate_and_send(
                smtp,
                message,
            )

    def _authenticate_and_send(
        self,
        smtp: smtplib.SMTP,
        message: EmailMessage,
    ) -> None:
        if (
            settings.SMTP_USERNAME
            and settings.SMTP_PASSWORD
        ):
            smtp.login(
                settings.SMTP_USERNAME,
                settings.SMTP_PASSWORD,
            )

        smtp.send_message(
            message
        )

    async def _send_email(
        self,
        message: EmailMessage,
        *,
        failure_message: str,
    ) -> None:
        try:
            await asyncio.to_thread(
                self._send_sync,
                message,
            )

        except smtplib.SMTPAuthenticationError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Email service authentication failed.",
            ) from exc

        except smtplib.SMTPRecipientsRefused as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The email provider refused the recipient address.",
            ) from exc

        except (
            smtplib.SMTPException,
            OSError,
            TimeoutError,
        ) as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=failure_message,
            ) from exc

    async def send_verification_email(
        self,
        recipient_email: str,
        recipient_name: str,
        otp: str,
    ) -> None:
        message = self._build_verification_email(
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            otp=otp,
        )

        await self._send_email(
            message,
            failure_message=(
                "Verification email could not be sent. "
                "Please try again shortly."
            ),
        )

    async def send_password_reset_email(
        self,
        recipient_email: str,
        recipient_name: str,
        otp: str,
    ) -> None:
        message = self._build_password_reset_email(
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            otp=otp,
        )

        await self._send_email(
            message,
            failure_message=(
                "Password reset email could not be sent. "
                "Please try again shortly."
            ),
        )


email_service = EmailService()