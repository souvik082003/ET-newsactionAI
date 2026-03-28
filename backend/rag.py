"""
rag.py — RAG engine with ChromaDB and sentence-transformers for ET NewsAction AI.
"""

import chromadb
from sentence_transformers import SentenceTransformer


class RAGEngine:
    """Manages per-session ChromaDB collections for RAG retrieval."""

    def __init__(self):
        self._model: SentenceTransformer | None = None
        self._client = chromadb.Client()  # in-memory
        self.sessions: dict[str, dict] = {}

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
        return self._model

    # ── Chunking ──────────────────────────────────────────────

    @staticmethod
    def _chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
        """Split text into overlapping word-level chunks."""
        words = text.split()
        chunks: list[str] = []
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            if chunk.strip():
                chunks.append(chunk)
            start += chunk_size - overlap
        return chunks

    # ── Session Management ────────────────────────────────────

    def create_session(self, session_id: str, article_data: dict) -> int:
        """Chunk, embed, and store an article in a new ChromaDB collection.
        Returns the number of chunks created."""
        collection_name = f"session_{session_id.replace('-', '_')[:48]}"

        # Delete if it already exists
        try:
            self._client.delete_collection(collection_name)
        except Exception:
            pass

        collection = self._client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

        text = article_data.get("text", "")
        title = article_data.get("title", "")
        chunks = self._chunk_text(text)

        if not chunks:
            return 0

        embeddings = self.model.encode(chunks).tolist()
        ids = [f"chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {"chunk_index": i, "source": article_data.get("source", ""), "title": title}
            for i in range(len(chunks))
        ]

        collection.add(
            documents=chunks,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas,
        )

        self.sessions[session_id] = {
            "collection_name": collection_name,
            "title": title,
            "chunk_count": len(chunks),
        }

        return len(chunks)

    def query_session(self, session_id: str, question: str, top_k: int = 4) -> list[str]:
        """Retrieve the top-k most relevant chunks for a question."""
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        collection = self._client.get_collection(name=session["collection_name"])
        query_embedding = self.model.encode([question]).tolist()

        results = collection.query(query_embeddings=query_embedding, n_results=top_k)
        return results.get("documents", [[]])[0]

    def delete_session(self, session_id: str) -> None:
        """Delete a session's ChromaDB collection."""
        session = self.sessions.pop(session_id, None)
        if session:
            try:
                self._client.delete_collection(session["collection_name"])
            except Exception:
                pass
