import os
import logging
from datetime import datetime

logger = logging.getLogger("obelisk-q")

try:
    import chromadb
    from chromadb.utils import embedding_functions
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    logger.warning("chromadb not installed. memory module running stateless.")


class AgentMemory:
    """
    Cloud-only vector memory for the Obelisk Q supervisory graph.
    
    ZERO-DISK POLICY: Local PersistentClient is permanently disabled.
    If CHROMA_CLOUD_URL is not set, the engine operates stateless.
    Set CHROMA_CLOUD_URL_REQUIRED=true to enforce cloud connectivity (mainnet).
    """

    def __init__(self):
        self.collection = None

        if not CHROMA_AVAILABLE:
            logger.info("memory: chromadb unavailable. stateless mode.")
            return

        cloud_url = os.getenv("CHROMA_CLOUD_URL")
        require_cloud = os.getenv("CHROMA_CLOUD_URL_REQUIRED", "false").lower() == "true"

        if not cloud_url:
            if require_cloud:
                raise EnvironmentError(
                    "FATAL: CHROMA_CLOUD_URL is not set but CHROMA_CLOUD_URL_REQUIRED=true. "
                    "Mainnet deployment requires cloud vector storage. "
                    "Local disk persistence is permanently disabled (0% disk policy)."
                )
            logger.info("memory: CHROMA_CLOUD_URL not set. stateless mode (0% disk persistence).")
            return

        # Cloud-only connection — no local fallback exists
        logger.info(f"memory: connecting to cloud vector store at {cloud_url}")
        self.client = chromadb.HttpClient(host=cloud_url)
        self.ef = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name="obelisk_memories",
            embedding_function=self.ef
        )
        logger.info("memory: cloud vector store connected. 0% local disk.")

    def store_cycle(self, score: int, regime: str, decision: str, analyst_insight: str):
        if not self.collection:
            return

        timestamp = datetime.now().isoformat()
        doc = f"Regime: {regime}. Stability Score: {score}. Decision: {decision}. Insight: {analyst_insight}"
        
        try:
            self.collection.add(
                documents=[doc],
                metadatas=[{"score": score, "regime": regime, "decision": decision, "timestamp": timestamp}],
                ids=[f"cycle_{timestamp}"]
            )
        except Exception as e:
            logger.warning(f"memory: failed to store cycle: {e}")

    def query_similar_conditions(self, current_insight: str, n_results: int = 3):
        if not self.collection:
            return None
        try:
            return self.collection.query(query_texts=[current_insight], n_results=n_results)
        except Exception as e:
            logger.warning(f"memory: query failed: {e}")
            return None


# Initialize global memory instance
agent_memory = AgentMemory()
