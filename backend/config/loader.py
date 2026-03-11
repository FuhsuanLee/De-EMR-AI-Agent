from __future__ import annotations
import os
import pathlib
import yaml
from typing import Any, Dict

_DEFAULT_PATH = pathlib.Path(__file__).parent / "config.yml"
_ENV_KEY = "CONFIG"

_settings_cache: Dict[str, Any] | None = None

def _load_yaml(path: pathlib.Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

def get_settings() -> Dict[str, Any]:
    global _settings_cache
    if _settings_cache is not None:
        return _settings_cache

    path_str = os.getenv(_ENV_KEY, str(_DEFAULT_PATH))
    path = pathlib.Path(path_str)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    data = _load_yaml(path)
    _settings_cache = data
    return data
