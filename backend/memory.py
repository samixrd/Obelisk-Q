try:
    import chromadb
    from chromadb.utils import embedding_functions
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    print("Warning: chromadb not found. Running in stateless mode.")

from datetime import datetime
import os

class AgentMemory:
    def __init__(self, persist_directory="./chroma_db"):
        if not CHROMA_AVAILABLE:
            self.collection = None
            return

        # use cloud client if url is provided, otherwise fallback to local (for safety)
        # in production azure vm, set CHROMA_CLOUD_URL to avoid local disk writes
        cloud_url = os.getenv("CHROMA_CLOUD_URL")
        if cloud_url:
            print(f"memory: connecting to cloud vector store at {cloud_url}")
            self.client = chromadb.HttpClient(host=cloud_url)
        else:
            print("memory: using local disk fallback (set CHROMA_CLOUD_URL to skip)")
            self.client = chromadb.PersistentClient(path=persist_directory)

        self.ef = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name="obelisk_memories",
            embedding_function=self.ef
        )

    def store_cycle(self, score: int, regime: str, decision: str, analyst_insight: str):
        if not self.collection:
            return

        timestamp = datetime.now().isoformat()
        doc = f"Regime: {regime}. Stability Score: {score}. Decision: {decision}. Insight: {analyst_insight}"
        
        self.collection.add(
            documents=[doc],
            metadatas=[{"score": score, "regime": regime, "decision": decision, "timestamp": timestamp}],
            ids=[f"cycle_{timestamp}"]
        )

    def query_similar_conditions(self, current_insight: str, n_results: int = 3):
        if not self.collection:
            return None
        return self.collection.query(query_texts=[current_insight], n_results=n_results)

# Initialize global memory instance
agent_memory = AgentMemory()
