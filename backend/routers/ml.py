from fastapi import APIRouter, UploadFile, File, HTTPException
import hashlib
import json
import os
from typing import Tuple, List

import google.generativeai as genai

from schemas.schemas import PredictOut

router = APIRouter()

DEFAULT_MODEL = os.environ.get("GEMINI_MODEL_NAME", "gemini-1.5-flash-001")
_genai_configured = False
_gemini_models: dict[str, genai.GenerativeModel] = {}
_supported_models: List[str] | None = None


def _get_gemini_model(model_name: str):
    global _genai_configured, _gemini_models
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured.")
    if not _genai_configured:
        genai.configure(api_key=api_key)
        _genai_configured = True
    if model_name not in _gemini_models:
        _gemini_models[model_name] = genai.GenerativeModel(model_name)
    return _gemini_models[model_name]


def _load_supported_models() -> List[str]:
    """
    Fetch available Gemini model names once, filtering to those that support generateContent.
    Returned names are normalized (without the leading `models/` prefix).
    """
    global _supported_models
    if _supported_models is not None:
        return _supported_models
    try:
        raw_models = genai.list_models()
    except Exception:
        _supported_models = []
        return _supported_models

    normalized: list[str] = []
    for model in raw_models:
        methods = getattr(model, "supported_generation_methods", []) or []
        if "generateContent" not in methods:
            continue
        name = getattr(model, "name", "")
        if not name:
            continue
        simple = name.split("/")[-1]
        # Some endpoints with 'latest' suffix are not yet accessible via v1beta generateContent; skip them.
        if simple.endswith("latest"):
            continue
        normalized.append(simple)
    _supported_models = normalized
    return _supported_models


def _candidate_models() -> List[str]:
    models: list[str] = []
    env_model = os.environ.get("GEMINI_MODEL_NAME")
    if env_model:
        models.append(env_model)
    models.append(DEFAULT_MODEL)
    models.append("gemini-1.5-flash")
    models.append("gemini-1.5-flash-002")
    models.extend(_load_supported_models())
    deduped: list[str] = []
    seen = set()
    for m in models:
        if not m:
            continue
        clean = m.split("/")[-1]
        if clean.endswith("latest"):
            continue
        if clean not in seen:
            deduped.append(clean)
            seen.add(clean)
    return deduped or ["gemini-1.5-flash-001"]


def detect_ewaste(image_bytes: bytes, mime_type: str | None = None) -> Tuple[bool, str]:
    """
    Use Google Gemini to determine whether the supplied image contains e-waste.
    Returns (is_ewaste, reason). Raises HTTPException if the API response cannot
    be interpreted.
    """
    resolved_mime = mime_type if (mime_type and mime_type.startswith("image/")) else "image/jpeg"
    prompt = (
        "You are verifying whether the provided photo shows discarded electronic waste. "
        "Classify as ewaste only when there are clear electronic components such as circuit boards, "
        "batteries, cables, screens, or other electronic devices intended for disposal. "
        "Respond strictly in JSON with the structure "
        '{"ewaste": true|false, "reason": "short explanation"}. '
        "If you are unsure, respond with ewaste=false."
    )
    last_exc: Exception | None = None
    for model_name in _candidate_models():
        try:
            model = _get_gemini_model(model_name)
            response = model.generate_content(
                [
                    prompt,
                    {"mime_type": resolved_mime, "data": image_bytes},
                ],
                generation_config={"response_mime_type": "application/json"},
            )
        except Exception as exc:
            last_exc = exc
            continue

        content = response.text or "".join(
            part.text
            for candidate in response.candidates
            for part in candidate.content.parts
            if getattr(part, "text", "")
        )
        try:
            payload = json.loads(content)
        except json.JSONDecodeError as exc:
            last_exc = exc
            continue

        is_ewaste = bool(payload.get("ewaste"))
        reason = payload.get("reason") or "No reason provided."
        return is_ewaste, reason

    raise HTTPException(status_code=502, detail=f"Gemini request failed: {last_exc}")


@router.post("/predict", response_model=PredictOut)
async def predict(file: UploadFile = File(...)) -> PredictOut:
    # Deterministic pseudo-classification based on filename
    try:
        name = file.filename or "unknown"
        h = int(hashlib.sha256(name.encode("utf-8")).hexdigest(), 16)
        categories = [
            ("Battery", "Take to a recycling center; avoid general trash."),
            ("Circuit Board", "Handle carefully; recycle at e-waste facility."),
            ("Plastic Casing", "Separate and recycle if local rules allow."),
            ("Metal Scrap", "Can be melted and reused; recycle."),
            ("Display Panel", "Contains hazardous materials; recycle safely."),
        ]
        idx = h % len(categories)
        base_conf = 0.65 + (h % 35) / 100.0
        category, suggestion = categories[idx]
        return PredictOut(category=category, confidence=round(min(base_conf, 0.99), 2), suggestion=suggestion)
    except Exception:
        raise HTTPException(status_code=400, detail="Prediction failed")


