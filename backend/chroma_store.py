"""
FairSign — ChromaDB Store
Stores past contract analyses as vectors for RAG.
Also stores user preferences for personalised tips.
"""

import json
import os
import chromadb
from chromadb.utils import embedding_functions

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")

client = chromadb.PersistentClient(path=CHROMA_PATH)

# Use sentence transformers for embeddings (free, local)
ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Two collections
analyses_collection = client.get_or_create_collection(
    name="contract_analyses",
    embedding_function=ef,
)

preferences_collection = client.get_or_create_collection(
    name="user_preferences",
    embedding_function=ef,
)


def store_analysis(user_id: str, analysis_id: str, analysis: dict, market: str):
    """
    Store a contract analysis in ChromaDB.
    The document text is a summary of the key findings — used for similarity search.
    """
    red_flags = analysis.get("redFlags", [])
    flag_text = " | ".join([f"{f['clause']} ({f['severity']})" for f in red_flags[:5]])

    document = (
        f"Market: {market}. "
        f"Score: {analysis.get('dealScore')}/10 ({analysis.get('scoreLabel')}). "
        f"Summary: {analysis.get('summary', '')} "
        f"Red flags: {flag_text}. "
        f"Advice: {analysis.get('overallAdvice', '')}"
    )

    analyses_collection.upsert(
        ids=[analysis_id],
        documents=[document],
        metadatas=[{
            "user_id": user_id,
            "market": market,
            "deal_score": str(analysis.get("dealScore", 0)),
            "score_label": analysis.get("scoreLabel", ""),
        }]
    )


def get_similar_analyses(user_id: str, query: str, n_results: int = 3) -> list:
    """
    Find past analyses similar to the current query.
    Used to give personalised context like:
    'Based on your past contracts, this royalty rate is lower than usual.'
    """
    try:
        results = analyses_collection.query(
            query_texts=[query],
            n_results=n_results,
            where={"user_id": user_id},
        )
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        return [{"summary": d, "meta": m} for d, m in zip(docs, metas)]
    except Exception:
        return []


def store_user_preference(user_id: str, preference_text: str):
    """
    Store a user preference or pattern.
    e.g. 'User always negotiates for master ownership'
         'User is an Afrobeats artist from Uganda'
    """
    pref_id = f"{user_id}_pref_{hash(preference_text) % 100000}"
    preferences_collection.upsert(
        ids=[pref_id],
        documents=[preference_text],
        metadatas=[{"user_id": user_id}]
    )


def get_user_context(user_id: str) -> str:
    """
    Build a personalised context string from the user's history.
    Injected into the AI system prompt for personalised analysis.
    """
    try:
        results = analyses_collection.get(where={"user_id": user_id}, limit=5)
        docs = results.get("documents", [])
        metas = results.get("metadatas", [])

        if not docs:
            return ""

        scores = []
        for m in metas:
            try:
                scores.append(int(m.get("deal_score", 0)))
            except Exception:
                pass

        avg_score = sum(scores) / len(scores) if scores else 0
        context = (
            f"This user has analysed {len(docs)} contracts before. "
            f"Average deal score: {avg_score:.1f}/10. "
            f"Recent analysis: {docs[0][:200] if docs else ''}"
        )
        return context
    except Exception:
        return ""