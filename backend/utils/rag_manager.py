# -*- coding: utf-8 -*-

from __future__ import annotations
from typing import List, Dict, Any, Optional
from pathlib import Path

from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.core.schema import TextNode
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.vector_stores import (
    MetadataFilters,
    ExactMatchFilter,
    FilterCondition
)

class RAGManager:

    def __init__(
        self, 
        storage_dir: str = "./storage",
        embed_model_name: str = "BAAI/bge-base-zh-v1.5"
    ):
        self.storage_dir = Path(storage_dir)
        self.embed_model_name = embed_model_name
        
        self._embed_model = HuggingFaceEmbedding(model_name=embed_model_name)
        
        self._index = self._load_or_create_index()
    
    def _load_or_create_index(self) -> VectorStoreIndex:
        if self.storage_dir.exists():
            storage_context = StorageContext.from_defaults(persist_dir=str(self.storage_dir))
            return load_index_from_storage(storage_context, embed_model=self._embed_model)
        else:
            index = VectorStoreIndex([], embed_model=self._embed_model)
            index.storage_context.persist(str(self.storage_dir))
            return index
    
    def add_documents(self, docs: List[Dict[str, Any]]) -> None:
        nodes: List[TextNode] = []
        
        for doc in docs:
            text = (doc.get("text") or "").strip()
            if not text:
                continue
                
            meta = doc.get("meta") or {}
            node = TextNode(text=text, metadata=meta)
            
            if doc.get("id"):
                node.id_ = str(doc["id"])
                
            nodes.append(node)
        if nodes:
            self._index.insert_nodes(nodes)
            self._index.storage_context.persist(str(self.storage_dir))
    
    def search(self, query: str, top_k: int = 3, filters: Optional[Dict[str, str]] = None):
        metadata_filters = None
        if filters:
            exact_filters = []
            for key, value in filters.items():
                exact_filters.append(
                    ExactMatchFilter(key=key, value=value)
                )

            metadata_filters = MetadataFilters(
                filters=exact_filters,
                condition=FilterCondition.AND
            )

        retriever = self._index.as_retriever(
            similarity_top_k=top_k,
            filters=metadata_filters
        )

        nodes = retriever.retrieve(query)

        results = []
        for node_with_score in nodes:
            node = getattr(node_with_score, "node", None) or node_with_score
            score = getattr(node_with_score, "score", 0.0) or 0.0
            results.append({
                "score": float(score),
                "text": getattr(node, "text", ""),
                "meta": getattr(node, "metadata", {}) or {},
            })

        return results