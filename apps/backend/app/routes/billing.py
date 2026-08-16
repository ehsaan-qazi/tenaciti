from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.middleware.tier_gate import get_file_size_limit_bytes
from app.middleware.auth import get_verified_user
from app.services.billing_adapter import get_billing_provider

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.post("/webhook")
async def handle_billing_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handles incoming payment gateway webhook events via the active billing provider."""
    provider = get_billing_provider()
    return await provider.handle_webhook(request, db)


@router.get("/checkout-url")
async def get_checkout_url(current_user: User = Depends(get_verified_user)):
    """
    Returns the checkout URL for the Pro/Premium plan from the active billing provider.
    If no billing provider is active, returns available: False and message indicating
    that Premium features are coming soon.
    """
    provider = get_billing_provider()
    checkout_url = await provider.get_checkout_url(current_user)

    if not checkout_url:
        return {
            "available": False,
            "checkout_url": None,
            "message": "Premium features are coming soon. Subscriptions are not currently open.",
        }

    return {
        "available": True,
        "checkout_url": checkout_url,
    }


@router.get("/limits")
async def get_tier_limits(current_user: User = Depends(get_verified_user)):
    """
    Returns the current user's tier limits for file uploads and document counts.
    """
    is_pro = current_user.plan == "pro"
    max_file_size_bytes = get_file_size_limit_bytes(current_user)

    upload_limit = settings.pro_upload_limit if is_pro else settings.free_upload_limit

    return {
        "plan": current_user.plan,
        "plan_expires_at": current_user.plan_expires_at,
        "upload_limit_per_course": upload_limit,
        "max_file_size_mb": max_file_size_bytes // (1024 * 1024),
        "max_file_size_bytes": max_file_size_bytes,
        "pro_only_doc_types": ["instructor_notes", "slides"] if not is_pro else [],
    }
