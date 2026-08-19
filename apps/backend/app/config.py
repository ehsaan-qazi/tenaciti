"""
Tenaciti backend configuration.
Loads settings from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator, Field, AliasChoices


class Settings(BaseSettings):
    # ── Supabase ──────────────────────────────────────────────
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""  # For local JWT verification

    # ── Database ──────────────────────────────────────────────
    database_url: str = "postgresql+psycopg://tenaciti:tenaciti@localhost:5432/tenaciti"

    # ── App ───────────────────────────────────────────────────
    app_secret_key: str = "tenaciti-dev-secret-change-in-prod"
    debug: bool = True

    # ── Billing ───────────────────────────────────────────────
    billing_provider: str = "null"  # "null", "lemonsqueezy", etc.
    lemonsqueezy_api_key: str = ""
    lemonsqueezy_webhook_secret: str = ""
    lemonsqueezy_store_id: str = ""
    lemonsqueezy_variant_id: str = ""

    # ── Cloudflare R2 (Object Storage) ──────────────────────
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "tenaciti-uploads"

    # ── AI (Groq) ─────────────────────────────────────────────
    llm_api_key: str = ""
    llm_provider: str = "groq"

    # ── Tier Limits ──────────────────────────────────────────
    free_upload_limit: int = 3
    pro_upload_limit: int = 20
    free_max_file_size_mb: int = 10
    pro_max_file_size_mb: int = 25

    # ── CORS ─────────────────────────────────────────────────
    cors_origins: str = Field(
        default="https://my.tenaciti.app,https://tenaciti.app,https://www.tenaciti.app,http://localhost:5173,http://localhost:3000",
        validation_alias=AliasChoices("cors_origins", "cors_origin", "CORS_ORIGINS", "CORS_ORIGIN"),
    )

    # ── Email (Resend) ─────────────────────────────────────────
    resend_api_key: str = ""
    mail_from: str = "onboarding@resend.dev"  # Replace with verified domain in production

    @field_validator(
        "supabase_url", "supabase_anon_key", "supabase_service_role_key", "supabase_jwt_secret",
        "app_secret_key", "lemonsqueezy_api_key", "lemonsqueezy_webhook_secret",
        "lemonsqueezy_store_id", "lemonsqueezy_variant_id",
        "r2_account_id", "r2_access_key_id", "r2_secret_access_key", "r2_bucket_name",
        "llm_api_key", "resend_api_key",
        mode="after",
    )
    @classmethod
    def _strip_credentials(cls, v: str) -> str:
        """Strip stray whitespace and surrounding quotes from secret/env values.

        python-dotenv preserves quotes/trailing newlines in .env files, which
        breaks HMAC signing (e.g. R2 SignatureDoesNotMatch) and JWT verification.
        """
        if isinstance(v, str):
            return v.strip().strip('"').strip("'")
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()
