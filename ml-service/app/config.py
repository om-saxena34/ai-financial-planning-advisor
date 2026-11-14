"""
Configuration module for the ML service.
Uses pydantic-settings for environment-based configuration.
"""

from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables or defaults."""

    MODEL_DIR: str = "models"
    DATA_DIR: str = "data"
    MODEL_VERSION: str = "1.0.0"
    RANDOM_SEED: int = 42
    DATASET_SIZE: int = 10000

    @property
    def classifier_path(self) -> Path:
        """Path to the trained classifier model file."""
        return Path(self.MODEL_DIR) / "classifier.joblib"

    @property
    def regressor_path(self) -> Path:
        """Path to the trained regressor model file."""
        return Path(self.MODEL_DIR) / "regressor.joblib"

    @property
    def metrics_path(self) -> Path:
        """Path to the saved model metrics JSON file."""
        return Path(self.MODEL_DIR) / "metrics.json"

    model_config = {"env_prefix": "ML_", "env_file": ".env", "extra": "ignore"}


settings = Settings()
