# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import List
import pandas as pd
import os
import re



from .methods import classify_18_categories, extract_items, rag_search, combine_and_chat, normalize_output

category_csv_path = os.path.join("data", "domain_table.csv")
categories = pd.read_csv(category_csv_path)
categories = categories.rename(columns={"類別": "category", "描述": "description"})
categories["description"] = categories["description"].str.replace("\n", "", regex=False)
categories = categories[["category", "description"]].to_dict(orient="records")

item_csv_path = os.path.join("data", "item_data.csv")
items = pd.read_csv(item_csv_path)
items = items.rename(columns={"指標": "item"})
items = items[["item"]].to_dict(orient="records")


class Agent:

    def __init__(self, llm_client, rag):
        self.llm_client = llm_client
        self.rag = rag

    async def run(self, user_prompt: str):
        classify_resp: List[str] = await classify_18_categories(self.llm_client, user_prompt, categories)
        if classify_resp == []:
            return "由於缺乏足夠資訊，無法回答。"

        item_type: List[str] = await extract_items(self.llm_client, user_prompt, items)
        if item_type == []:
            return "由於缺乏足夠資訊，無法回答。"


        filter: List[str] = []
        for classify in classify_resp:
            for item in item_type:
                filter.append((classify, item))
        rag_data = rag_search(self.rag, user_prompt, filter)

        response_text = await combine_and_chat(self.llm_client, user_prompt, rag_data)
        response_normalize = await normalize_output(response_text)

        if re.fullmatch(r"!+", response_normalize):
            return response_text
        else:
            return response_normalize
        return response_text

