from openai import OpenAI
from openai import APITimeoutError


vllm_gpt_oss_120b_1="http://210.61.209.139:45014/v1/"
base_url = vllm_gpt_oss_120b_1
model_name = "openai/gpt-oss-120b"

client = OpenAI(
    base_url=base_url,
    api_key="dummy-key"
)

SYSTEM_PROMPT = """
修飾器需依據可用資料產生完整且有條理的回應，若資料不足或矛盾則僅回報限制，不得自行補內容。
"""
USER_PROMPT_TEMPLATE = r"""
【使用者輸入】
{USER_PROMPT}

請依據 SYSTEM_PROMPT 的規範，修飾使用者輸入的內容，並以繁體中文輸出完整的回應,不得新增、推論或捏造資料。
"""


async def normalize_output(user_prompt: str, temperature: float = 0.7):
    try:
        chat_response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": USER_PROMPT_TEMPLATE.format(USER_PROMPT=user_prompt)}
            ],
            temperature=temperature,
            timeout=3
        )
        raw = chat_response.choices[0].message.content

        marker = "assistantfinal"
        if marker in raw:
            _, after = raw.split(marker, 1)
            return after.strip()
        else:
            return raw.strip()

    except APITimeoutError:
        return "!!!!!!"