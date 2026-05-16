from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.providers import (
    OpenAIConfigurationError,
    OpenAIPlatformClient,
    VoyageConfigurationError,
    VoyagePlatformClient,
)
from backend.services.runtime_config import (
    get_mongo_runtime_status,
    get_openai_runtime_status,
    get_parallel_runtime_manifest,
    get_voyage_runtime_status,
)

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health(live: bool = False):
    mongo = get_mongo_runtime_status()
    openai = get_openai_runtime_status(live_validate=live)
    voyage = get_voyage_runtime_status(live_validate=live)
    runtime = get_parallel_runtime_manifest()
    configured_failures = [
        provider
        for provider, status in {
            "mongo": mongo,
            "openai": openai,
            "voyage": voyage,
        }.items()
        if status["configured"] and not status["ready"]
    ]

    payload = {
        "healthy": not configured_failures,
        "validationMode": "live" if live else "configuration",
        "failingProviders": configured_failures,
        "service": "Prototype Sprint Kit API",
        "version": "0.2.0",
        "environment": settings.resolved_app_env,
        "runtime": runtime,
        "providers": {
            "mongo": {
                "configured": mongo["configured"],
                "connected": mongo["connected"],
                "ready": mongo["ready"],
                "reason": mongo["reason"],
                "validationMode": mongo["validationMode"],
                "liveValidated": mongo["liveValidated"],
                "database": settings.resolved_database_name,
            },
            "openai": {
                "configured": openai["configured"],
                "ready": openai["ready"],
                "reason": openai["reason"],
                "chatModel": openai["chatModel"],
                "embeddingModel": openai["embeddingModel"],
                "chatReady": openai["chatReady"],
                "embeddingsReady": openai["embeddingsReady"],
                "validationMode": openai["validationMode"],
                "liveValidated": openai["liveValidated"],
                "liveEndpoint": openai["liveEndpoint"],
                "liveResult": openai.get("liveResult"),
            },
            "voyage": {
                "configured": voyage["configured"],
                "ready": voyage["ready"],
                "reason": voyage["reason"],
                "embeddingModel": voyage["embeddingModel"],
                "rerankModel": voyage["rerankModel"],
                "embeddingsReady": voyage["embeddingsReady"],
                "rerankReady": voyage["rerankReady"],
                "validationMode": voyage["validationMode"],
                "liveValidated": voyage["liveValidated"],
                "liveEndpoint": voyage["liveEndpoint"],
                "liveResult": voyage.get("liveResult"),
            },
        },
    }

    if live and configured_failures:
        return JSONResponse(status_code=503, content=payload)

    return payload


@router.get("/health/openai")
async def openai_health():
    try:
        client = OpenAIPlatformClient()
        return client.validate_runtime()
    except OpenAIConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI runtime validation failed: {exc}") from exc


@router.get("/health/voyage")
async def voyage_health():
    try:
        client = VoyagePlatformClient()
        return client.validate_runtime()
    except VoyageConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Voyage runtime validation failed: {exc}") from exc
