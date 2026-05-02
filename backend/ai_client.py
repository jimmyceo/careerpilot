"""
Standalone AI client for Hunt-X (no external dependencies)
Replaces company_config imports

Task #40: Flipped AI model priority
- PRIMARY: claude-haiku-4-5 (Anthropic) - Cost optimized for structured JSON
- FALLBACK: gpt-4o-mini (OpenAI) - Reliable backup
"""

import os
import httpx
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Model configuration
PRIMARY_MODEL = "claude-3-5-haiku-20241022"
FALLBACK_MODEL = "gpt-4o-mini"

# API Configuration
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
ANTHROPIC_BASE_URL = os.getenv('ANTHROPIC_BASE_URL', 'https://api.anthropic.com/v1')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
OLLAMA_API_KEY = os.getenv('OLLAMA_API_KEY', '')
OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'https://api.ollama.ai/v1')

# Usage tracking
_model_usage_stats: Dict[str, Dict[str, Any]] = {
    PRIMARY_MODEL: {"count": 0, "input_tokens": 0, "output_tokens": 0, "errors": 0},
    FALLBACK_MODEL: {"count": 0, "input_tokens": 0, "output_tokens": 0, "errors": 0},
}

# Reusable async client
_async_client = httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0))


class AnthropicError(Exception):
    """Raised when Anthropic API fails"""
    pass


class OpenAIError(Exception):
    """Raised when OpenAI API fails"""
    pass


def _log_model_usage(
    model_name: str,
    input_tokens: int,
    output_tokens: int,
    user_id: str = "anonymous",
    status: str = "success"
) -> None:
    """
    Log model usage with required format:
    [AI] Model: {model_name}, Tokens: {input}/{output}, User: {user_id}
    """
    log_message = f"[AI] Model: {model_name}, Tokens: {input_tokens}/{output_tokens}, User: {user_id}"
    if status == "error":
        logger.error(log_message + f" [Status: {status}]")
    else:
        logger.info(log_message)

    # Update stats
    if model_name in _model_usage_stats:
        _model_usage_stats[model_name]["count"] += 1
        _model_usage_stats[model_name]["input_tokens"] += input_tokens
        _model_usage_stats[model_name]["output_tokens"] += output_tokens
        if status == "error":
            _model_usage_stats[model_name]["errors"] += 1


async def _call_anthropic(
    prompt: str,
    system: str = "You are a helpful assistant.",
    user_id: str = "anonymous",
    max_tokens: int = 4096
) -> Tuple[str, int, int]:
    """
    Call Anthropic API (Haiku 3.5) - PRIMARY MODEL
    Returns: (content, input_tokens, output_tokens)
    Raises AnthropicError on failure
    """
    try:
        headers = {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }

        data = {
            "model": PRIMARY_MODEL,
            "max_tokens": max_tokens,
            "system": system,
            "messages": [{"role": "user", "content": prompt}]
        }

        response = await _async_client.post(
            f"{ANTHROPIC_BASE_URL}/messages",
            headers=headers,
            json=data
        )

        if response.status_code != 200:
            logger.error(f"[AI] Anthropic HTTP {response.status_code}: {response.text[:500]}")
            raise AnthropicError(f"Anthropic API Error: {response.status_code} - {response.text[:200]}")

        result = response.json()
        content_blocks = result.get("content", [])
        if not content_blocks:
            logger.error(f"[AI] Anthropic empty content blocks: {result}")
            raise AnthropicError("Anthropic returned empty content blocks")
        content = content_blocks[0].get("text", "")
        if not content:
            logger.error(f"[AI] Anthropic empty text in content block: {result}")
        usage = result.get("usage", {})
        input_tokens = usage.get("input_tokens", 0)
        output_tokens = usage.get("output_tokens", 0)

        _log_model_usage(PRIMARY_MODEL, input_tokens, output_tokens, user_id, "success")
        return content, input_tokens, output_tokens

    except httpx.RequestError as e:
        raise AnthropicError(f"Anthropic request failed: {str(e)}")
    except Exception as e:
        raise AnthropicError(f"Anthropic error: {str(e)}")


async def _call_openai(
    prompt: str,
    system: str = "You are a helpful assistant.",
    user_id: str = "anonymous",
    max_tokens: int = 4096
) -> Tuple[str, int, int]:
    """
    Call OpenAI API (GPT-4o-mini) - FALLBACK MODEL
    Returns: (content, input_tokens, output_tokens)
    Raises OpenAIError on failure
    """
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        data = {
            "model": FALLBACK_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens
        }

        response = await _async_client.post(
            f"{OPENAI_BASE_URL}/chat/completions",
            headers=headers,
            json=data
        )

        if response.status_code != 200:
            error_msg = f"OpenAI API Error: {response.status_code} - {response.text}"
            raise OpenAIError(error_msg)

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        usage = result.get("usage", {})
        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)

        _log_model_usage(FALLBACK_MODEL, input_tokens, output_tokens, user_id, "success")
        return content, input_tokens, output_tokens

    except httpx.RequestError as e:
        raise OpenAIError(f"OpenAI request failed: {str(e)}")
    except Exception as e:
        raise OpenAIError(f"OpenAI error: {str(e)}")


async def ai_query(
    prompt: str,
    system: str = "You are a helpful assistant.",
    user_id: str = "anonymous",
    max_tokens: int = 4096,
    force_fallback: bool = False
) -> str:
    """
    Query AI with automatic fallback.

    Priority:
    1. PRIMARY: claude-haiku-4-5 (Anthropic) - cost optimized
    2. FALLBACK: gpt-4o-mini (OpenAI) - on AnthropicError

    Args:
        prompt: User prompt
        system: System message
        user_id: User identifier for logging
        max_tokens: Maximum tokens to generate
        force_fallback: If True, skip primary and use fallback directly

    Returns:
        AI response content
    """
    # Try PRIMARY model first (unless force_fallback)
    if not force_fallback:
        try:
            logger.info(f"[AI] Attempting primary model: {PRIMARY_MODEL}")
            content, input_tokens, output_tokens = await _call_anthropic(
                prompt, system, user_id, max_tokens
            )
            return content
        except AnthropicError as e:
            logger.warning(f"[AI] Primary model failed: {e}. Falling back to {FALLBACK_MODEL}")
            _model_usage_stats[PRIMARY_MODEL]["errors"] += 1
            # Continue to fallback

    # FALLBACK model (on AnthropicError or if force_fallback)
    try:
        logger.info(f"[AI] Using fallback model: {FALLBACK_MODEL}")
        content, input_tokens, output_tokens = await _call_openai(
            prompt, system, user_id, max_tokens
        )
        return content
    except OpenAIError as e:
        logger.error(f"[AI] Fallback model also failed: {e}")
        _model_usage_stats[FALLBACK_MODEL]["errors"] += 1
        return f"AI Service Error: Both primary and fallback models failed. {e}"


async def ai_query_json(
    prompt: str,
    system: str = "You are a helpful assistant. Respond with valid JSON only.",
    user_id: str = "anonymous",
    max_tokens: int = 4096
) -> Dict:
    """
    Query AI and return JSON response.
    Falls back on AnthropicError.

    Returns:
        Parsed JSON dict or error dict
    """
    import json

    response = await ai_query(prompt, system, user_id, max_tokens)

    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        logger.error(f"[AI] Failed to parse JSON response: {e}")
        return {"error": "Invalid JSON response", "raw_response": response}


def get_model_usage_stats() -> Dict[str, Dict[str, Any]]:
    """
    Get model usage statistics.

    Returns:
        Dict with usage stats per model:
        {
            "claude-haiku-4-5": {"count": X, "input_tokens": Y, "output_tokens": Z, "errors": W},
            "gpt-4o-mini": {"count": X, "input_tokens": Y, "output_tokens": Z, "errors": W}
        }
    """
    return {
        "models": _model_usage_stats.copy(),
        "total_requests": sum(m["count"] for m in _model_usage_stats.values()),
        "total_errors": sum(m["errors"] for m in _model_usage_stats.values()),
        "primary_model": PRIMARY_MODEL,
        "fallback_model": FALLBACK_MODEL
    }


def reset_model_usage_stats() -> None:
    """Reset all model usage statistics to zero"""
    global _model_usage_stats
    _model_usage_stats = {
        PRIMARY_MODEL: {"count": 0, "input_tokens": 0, "output_tokens": 0, "errors": 0},
        FALLBACK_MODEL: {"count": 0, "input_tokens": 0, "output_tokens": 0, "errors": 0},
    }
    logger.info("[AI] Model usage stats reset")


# Legacy function - kept for backward compatibility
async def kimi_query(prompt: str, system: str = "You are a helpful assistant.") -> str:
    """Query Ollama/Kimi API for AI responses (legacy support)"""
    try:
        headers = {
            'Authorization': f'Bearer {OLLAMA_API_KEY}',
            'Content-Type': 'application/json'
        }

        data = {
            'model': 'kimi-k2.5',
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': prompt}
            ],
            'stream': False
        }

        response = await _async_client.post(
            f'{OLLAMA_BASE_URL}/chat/completions',
            headers=headers,
            json=data
        )

        if response.status_code == 200:
            result = response.json()
            return result.get('choices', [{}])[0].get('message', {}).get('content', 'No response')
        else:
            return f"API Error: {response.status_code}"

    except Exception as e:
        return f"Error: {str(e)}"


def notify(message: str):
    """Notification stub - could integrate with Telegram later"""
    logging.getLogger("hunt-x.ai").info(f"[NOTIFY] {message}")


# Module-level convenience function
query = ai_query


class AIClient:
    """
    Wrapper class for AI operations.
    Provides query and query_json methods for AI interactions.
    """

    def __init__(self):
        """Initialize AI client"""
        pass

    async def query(
        self,
        prompt: str,
        system: str = "You are a helpful assistant.",
        user_id: str = "anonymous",
        max_tokens: int = 4096
    ) -> str:
        """
        Query AI with automatic fallback.

        Args:
            prompt: User prompt
            system: System message
            user_id: User identifier for logging
            max_tokens: Maximum tokens to generate

        Returns:
            AI response content
        """
        return await ai_query(prompt, system, user_id, max_tokens)

    async def query_json(
        self,
        prompt: str,
        system: str = "You are a helpful assistant. Respond with valid JSON only.",
        user_id: str = "anonymous",
        max_tokens: int = 4096
    ) -> Dict:
        """
        Query AI and return JSON response.

        Returns:
            Parsed JSON dict or error dict
        """
        return await ai_query_json(prompt, system, user_id, max_tokens)

    # Aliases for backward compatibility with services using generate/generate_json
    generate = query
    generate_json = query_json


if __name__ == "__main__":
    # Test imports and basic functionality
    print("Testing AI client imports...")
    print(f"Primary model: {PRIMARY_MODEL}")
    print(f"Fallback model: {FALLBACK_MODEL}")
    print(f"Stats: {get_model_usage_stats()}")
    print("Import test successful!")
