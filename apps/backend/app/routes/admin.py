"""
Admin routes — internal operational endpoints.
Requires authentication (any authenticated user can view; you could restrict to admins later).
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_verified_user
from app.models.user import User
from app.services.groq_router import get_router, GROQ_MODEL_PRIORITY, COOLDOWN_SECONDS, FAILURE_THRESHOLD

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/llm/status")
async def get_llm_status(current_user: User = Depends(get_verified_user)) -> dict:
    """
    Return the current circuit-breaker state for each Groq model.

    Useful for debugging rate-limit fallback behavior at runtime.

    Requires admin privileges.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )

    router_instance = get_router()
    return {
        "config": {
            "failure_threshold": FAILURE_THRESHOLD,
            "cooldown_seconds": COOLDOWN_SECONDS,
            "model_priority": GROQ_MODEL_PRIORITY,
        },
        "models": router_instance.status(),
    }


import os
import boto3
from botocore.config import Config

@router.get("/debug/test-r2")
def test_r2(secret: str):
    if secret != os.environ.get("DEBUG_SECRET"):
        raise HTTPException(status_code=404)

    try:
        client = boto3.client(
            's3',
            endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
            aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
            region_name='auto',
            config=Config(signature_version='s3v4', s3={'addressing_style': 'path'})
        )
        resp = client.put_object(
            Bucket=os.environ['R2_BUCKET_NAME'],
            Key='debug-test.txt',
            Body=b'hello from render'
        )
        return {"success": True, "etag": resp.get("ETag")}
    except Exception as e:
        error_dict = getattr(e, "response", {}).get("Error", {}) if hasattr(e, "response") else {}
        secret = os.environ.get('R2_SECRET_ACCESS_KEY', '')
        return {
            "success": False,
            "error_type": type(e).__name__,
            "error": str(e),
            "boto3_version": boto3.__version__,
            "full_error_details": error_dict,
            "access_key_being_used": os.environ.get('R2_ACCESS_KEY_ID', '')[:4] + '...' + os.environ.get('R2_ACCESS_KEY_ID', '')[-4:],
            "secret_key_length": len(secret),
            "secret_key_first_4": secret[:4],
            "secret_key_last_4": secret[-4:],
            "response_meta": getattr(e, "response", {}).get("ResponseMetadata", {}) if hasattr(e, "response") else None,
        }
