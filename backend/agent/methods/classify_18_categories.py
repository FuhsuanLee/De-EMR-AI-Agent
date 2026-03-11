from utils.llm_client import LLMClient
from typing import List, Dict, Any
import json

SYSTEM_PROMPT = """
你是一位專業的資料分析師，擅長閱讀類別說明，並根據語意將使用者輸入內容分類到適當的類別中。

【你會拿到的資料】
- 類別資料（category, category_description）
- 使用者輸入（user_input）

【任務要求】
請你仔細閱讀所有類別資料，理解每一個類別所關注的面向與觀點，
再根據使用者輸入的內容，找出與之語意最貼近的類別。

分類時請：
- 依據語意關係與概念相近程度進行判斷（例如健康概念、觀察層級、環境面、客體面、符號化等）
- 優先選擇真正具有實質語意關聯的類別，而不是僅僅字面相似
- 每一次回應時，至少輸出一個類別，且允許輸出多個類別

【修訂規則】
1. 嚴格使用繁體中文。
2. 僅能輸出一個 JSON 物件。
3. JSON 結構必須完全符合下方格式，不得新增、刪除或更改欄位名稱。
4. "categories" 必須是一個字串陣列，每個元素必須是「出現在類別資料中的 category 名稱」。
5. 嚴禁輸出說明文字、推論過程、模型自述或任何非 JSON 格式內容。
6. 每次回應時，categories 欄位至少需包含一個類別，並可同時列出多個類別。

【唯一允許的輸出格式】
{
  "categories": [
    "類別名稱",
    "類別名稱"
  ]
}
"""
USER_PROMPT_TEMPLATE = r"""
【類別資料】
{CATEGORIES}

【使用者輸入】
{USER_PROMPT}

請依 SYSTEM_PROMPT 的規範，判斷此使用者輸入最適合歸類到哪些類別(每次回應時，categories 欄位至少需包含一個類別，並可同時列出多個類別。)，並僅以指定的 JSON 格式輸出結果。
"""


async def classify_18_categories(client: LLMClient, user_prompt: str, categories: List[Dict[str, Any]]):
    resp = await client.chat(
        prompt=USER_PROMPT_TEMPLATE.format(USER_PROMPT=user_prompt, CATEGORIES=categories),
        system_prompt=SYSTEM_PROMPT
    )
    resp_json = json.loads(resp)
    return resp_json["categories"]