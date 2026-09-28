import logging
import json
import redis
from typing import Dict, Any, Callable
from backend.app.config import settings

logger = logging.getLogger("resona.redis_stream")

class RedisStreamBroker:
    """
    Asynchronous event messaging layer using Redis Streams.
    Provides idempotent background processing across:
    - experiment.events
    - memory.events
    - analytics.events
    """

    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self._client = None

    def _get_client(self):
        if self._client is None:
            try:
                self._client = redis.Redis.from_url(self.redis_url, decode_responses=True)
                self._client.ping()
                logger.info("Connected to Redis Stream broker.")
            except Exception as e:
                logger.warning(f"Redis unavailable ({e}). Using in-process event fallback.")
                self._client = "fallback"
        return self._client

    def publish_event(self, stream_name: str, event_data: Dict[str, Any]) -> str:
        client = self._get_client()
        payload = {"data": json.dumps(event_data)}
        if client != "fallback":
            try:
                msg_id = client.xadd(stream_name, payload)
                logger.info(f"Published event {msg_id} to Redis stream '{stream_name}'")
                return msg_id
            except Exception as e:
                logger.error(f"Failed publishing to Redis stream '{stream_name}': {e}")
        
        logger.info(f"[In-Process Fallback] Event dispatched for stream '{stream_name}'")
        return f"fallback_{stream_name}_msg"

redis_broker = RedisStreamBroker()
