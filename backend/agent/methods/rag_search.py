from typing import List, Tuple
from utils.rag_manager import RAGManager


def rag_search(rag: RAGManager, user_prompt: str, filters: List[Tuple[str, str]]):
    rag_data = []
    if filters:
        for filter in filters:
            filter_dict = {
                "item": filter[1]
            }
            rag_data = rag.search(user_prompt, filters=filter_dict)
            if rag_data:
                rag_data.extend(rag_data)
    else:
        rag_data = rag.search(user_prompt)
    return rag_data