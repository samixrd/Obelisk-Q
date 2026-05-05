import chromadb
from chromadb.utils import embedding_functions
from datetime import datetime
import os

class AgentMemory:
    def __init__(self, persist_directory="./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Use a simple local embedding function
        # In production, use SentenceTransformer or OpenAI embeddings
        self.ef = embedding_functions.DefaultEmbeddingFunction()
        
        self.collection = self.client.get_or_create_collection(
            name="obelisk_memories",
            embedding_function=self.ef
        )

    def store_cycle(self, score: int, regime: str, decision: str, analyst_insight: str):
        """Stores the result of an analysis cycle for future recall."""
        timestamp = datetime.now().isoformat()
        
        # We store the insight text as the main document for semantic search
        doc = f"Regime: {regime}. Stability Score: {score}. Decision: {decision}. Insight: {analyst_insight}"
        
        self.collection.add(
            documents=[doc],
            metadatas=[{
                "score": score,
                "regime": regime,
                "decision": decision,
                "timestamp": timestamp
            }],
            ids=[f"cycle_{timestamp}"]
        )
        print(f"Stored cycle memory: {timestamp}")

    def query_similar_conditions(self, current_insight: str, n_results: int = 3):
        """Finds past cycles with similar market conditions."""
        results = self.collection.query(
            query_texts=[current_insight],
            n_results=n_results
        )
        return results

# Initialize global memory instance
if not os.path.exists("./chroma_db"):
    os.makedirs("./chroma_db")

agent_memory = AgentMemory()
