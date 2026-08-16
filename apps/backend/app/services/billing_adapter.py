"""
Billing Adapter — Provider-agnostic billing abstraction.

Supports active payment providers (e.g. LemonSqueezy) as well as NullBillingProvider
when billing is not active / premium features are coming soon.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from datetime import datetime
import hmac
import hashlib
from fastapi import Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.user import User
from app.models.subscription import Subscription


class BillingProvider(ABC):
    """Abstract base class for all billing/payment gateway providers."""

    @abstractmethod
    async def get_checkout_url(self, user: User) -> Optional[str]:
        """
        Generate or return a checkout URL for the Pro/Premium plan.
        Returns None if the provider is inactive.
        """
        pass

    @abstractmethod
    async def handle_webhook(self, request: Request, db: AsyncSession) -> Dict[str, Any]:
        """Process incoming webhook events from the payment gateway."""
        pass


class NullBillingProvider(BillingProvider):
    """
    Null / No-op Billing Provider.
    Used when paid subscriptions are not active or payment gateway is disabled.
    """

    async def get_checkout_url(self, user: User) -> Optional[str]:
        """Returns None indicating no checkout gateway is available."""
        return None

    async def handle_webhook(self, request: Request, db: AsyncSession) -> Dict[str, Any]:
        """No-op webhook handler."""
        return {"status": "ignored", "reason": "Billing provider is inactive"}


class LemonSqueezyBillingProvider(BillingProvider):
    """LemonSqueezy payment provider implementation."""

    def _verify_signature(self, payload: bytes, signature: str, secret: str) -> bool:
        """Verifies the webhook signature from LemonSqueezy."""
        expected_signature = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_signature, signature)

    async def get_checkout_url(self, user: User) -> Optional[str]:
        """Generates a LemonSqueezy checkout URL for the user."""
        if not settings.lemonsqueezy_store_id or not settings.lemonsqueezy_variant_id:
            return None

        return (
            f"https://{settings.lemonsqueezy_store_id}.lemonsqueezy.com/checkout/buy/"
            f"{settings.lemonsqueezy_variant_id}?checkout[email]={user.email}"
        )

    async def handle_webhook(self, request: Request, db: AsyncSession) -> Dict[str, Any]:
        """Handles LemonSqueezy webhook events."""
        signature = request.headers.get("X-Signature")
        if not signature:
            raise HTTPException(status_code=400, detail="Missing signature")

        payload = await request.body()

        if settings.lemonsqueezy_webhook_secret:
            if not self._verify_signature(payload, signature, settings.lemonsqueezy_webhook_secret):
                raise HTTPException(status_code=400, detail="Invalid signature")

        data = await request.json()
        event_name = data.get("meta", {}).get("event_name")
        attributes = data.get("data", {}).get("attributes", {})
        customer_id = str(attributes.get("customer_id")) if attributes.get("customer_id") else None
        user_email = attributes.get("user_email")
        provider_sub_id = str(data.get("data", {}).get("id"))
        sub_status = attributes.get("status")

        if not user_email:
            return {"status": "ignored", "reason": "No email provided"}

        result = await db.execute(select(User).where(User.email == user_email))
        user = result.scalar_one_or_none()

        if not user:
            return {"status": "ignored", "reason": "User not found"}

        if event_name in ["subscription_created", "subscription_updated"]:
            sub_result = await db.execute(
                select(Subscription).where(Subscription.user_id == user.id)
            )
            subscription = sub_result.scalar_one_or_none()

            if not subscription:
                subscription = Subscription(
                    user_id=user.id,
                    provider="lemonsqueezy",
                    provider_sub_id=provider_sub_id,
                    provider_customer_id=customer_id,
                    status=sub_status or "active",
                )
                db.add(subscription)
            else:
                subscription.provider_sub_id = provider_sub_id
                subscription.provider_customer_id = customer_id
                subscription.status = sub_status or "active"

            renews_at = attributes.get("renews_at")
            if renews_at:
                try:
                    subscription.renews_at = datetime.fromisoformat(renews_at.replace("Z", "+00:00"))
                    user.plan_expires_at = subscription.renews_at
                except Exception:
                    pass

            if sub_status in ["active", "on_trial", "paid"]:
                user.plan = "pro"
            else:
                user.plan = "free"

            await db.commit()
            return {"status": "success", "action": "updated"}

        elif event_name in ["subscription_cancelled", "subscription_expired"]:
            sub_result = await db.execute(
                select(Subscription).where(Subscription.provider_sub_id == provider_sub_id)
            )
            subscription = sub_result.scalar_one_or_none()

            if subscription:
                subscription.status = sub_status or "cancelled"
                subscription.cancelled_at = datetime.now()

            user.plan = "free"
            user.plan_expires_at = None

            await db.commit()
            return {"status": "success", "action": "cancelled"}

        return {"status": "ignored", "reason": f"Unhandled event type: {event_name}"}


def get_billing_provider() -> BillingProvider:
    """
    Factory function returning the active BillingProvider instance based on configuration.
    Defaults to NullBillingProvider if billing is disabled or credentials are missing.
    """
    provider_name = (settings.billing_provider or "null").strip().lower()

    if provider_name == "lemonsqueezy":
        # Ensure minimum required credentials exist
        if settings.lemonsqueezy_store_id and settings.lemonsqueezy_variant_id:
            return LemonSqueezyBillingProvider()

    return NullBillingProvider()
