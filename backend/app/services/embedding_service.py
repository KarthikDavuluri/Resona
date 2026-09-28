import logging
import numpy as np
from typing import List, Optional
from backend.app.config import settings

logger = logging.getLogger("resona.embeddings")

class EmbeddingService:
    """
    Generates text embeddings using Sentence Transformers for experiment descriptions,
    observations, reactions, and failure records.
    """

    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL_NAME
        self._model = None

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
                logger.info(f"Loaded SentenceTransformer model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer ({e}). Using deterministic fallback vector generator.")
                self._model = "fallback"

    def encode(self, text: str) -> List[float]:
        """Encodes text into a float embedding vector."""
        if not text:
            text = "empty scientific text"
        self._load_model()
        if self._model != "fallback":
            try:
                vector = self._model.encode(text)
                return vector.tolist()
            except Exception as e:
                logger.error(f"Error encoding text: {e}")
        
        # Deterministic fallback vector encoding based on text hash
        seed = sum(ord(c) for c in text)
        rng = np.random.RandomState(seed % 2**32)
        vec = rng.randn(settings.EMBEDDING_DIMENSION)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Computes cosine similarity between two float vectors."""
        v1 = np.array(vec1)
        v2 = np.array(vec2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.dot(v1, v2) / (norm1 * norm2))

embedding_service = EmbeddingService()
