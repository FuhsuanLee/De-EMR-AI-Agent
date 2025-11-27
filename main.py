from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
import os
import json
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# ======================================================
# 初始化 FastAPI
# ======================================================
app = FastAPI(
    title="De-EMR Agent MVP",
    description="健康向量 + 語意推論 + Log 記錄",
    version="0.4.1",
)

# ======================================================
# 初始化 OpenAI
# ======================================================
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# ======================================================
# 建立 logs 資料夾（使用 main.py 的絕對路徑）
# ======================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # main.py 所在位置
LOG_DIR = os.path.join(BASE_DIR, "logs")               # 絕對路徑 logs 資料夾
os.makedirs(LOG_DIR, exist_ok=True)                    # 自動建立 logs

def write_log(data: dict):
    """將分析結果寫入 logs/ 中，存成 JSON"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(LOG_DIR, f"log_{timestamp}.json")

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return filename

# ======================================================
# 健康資料模型
# ======================================================
class HealthData(BaseModel):
    heart_rate_variability: float = Field(..., description="HRV（毫秒）")
    sleep_hours: float = Field(..., description="睡眠時數")
    steps: int = Field(..., description="今日步數")
    systolic_bp_morning: Optional[int] = Field(None, description="清晨收縮壓（mmHg）")
    diastolic_bp_morning: Optional[int] = Field(None, description="清晨舒張壓（mmHg）")
    note: Optional[str] = Field(None, description="主觀症狀 / 手動描述（可選）")

# ======================================================
# 健康向量模型
# ======================================================
class HealthVector(BaseModel):
    autonomic_load: float
    sleep_balance: float
    activity_level: float
    blood_pressure_risk: float

# ======================================================
# Rule-based Encoder
# ======================================================
def encode_autonomic_load(hrv: float) -> float:
    if hrv <= 30:
        return 0.2
    elif hrv >= 120:
        return 1.0
    return 0.2 + (hrv - 30) / 90 * 0.8

def encode_sleep_balance(hours: float) -> float:
    if 7 <= hours <= 8:
        return 1.0
    elif 6 <= hours < 7 or 8 < hours <= 9:
        return 0.7
    elif 5 <= hours < 6 or 9 < hours <= 10:
        return 0.4
    return 0.2

def encode_activity_level(steps: int) -> float:
    if steps >= 10000:
        return 1.0
    elif 8000 <= steps < 10000:
        return 0.8
    elif 5000 <= steps < 8000:
        return 0.5
    elif 3000 <= steps < 5000:
        return 0.3
    return 0.2

def encode_bp_risk(sys: Optional[int], dia: Optional[int]) -> float:
    if sys is None or dia is None:
        return 0.5
    if sys < 120 and dia < 80:
        return 0.2
    elif 120 <= sys < 130 and dia < 80:
        return 0.4
    elif 130 <= sys < 140 or 80 <= dia < 90:
        return 0.7
    return 0.9

def encode_health_vector(data: HealthData) -> HealthVector:
    return HealthVector(
        autonomic_load=encode_autonomic_load(data.heart_rate_variability),
        sleep_balance=encode_sleep_balance(data.sleep_hours),
        activity_level=encode_activity_level(data.steps),
        blood_pressure_risk=encode_bp_risk(
            data.systolic_bp_morning, data.diastolic_bp_morning
        ),
    )

# ======================================================
# 提示詞
# ======================================================
PROMPT_SYSTEM = """
你是一個溫柔、正向、鼓勵使用者的健康 AI Agent。
請使用 JSON 回傳：
{
  "summary": "",
  "potential_risks": [],
  "risk_level": "",
  "short_term_actions": [],
  "weekly_strategy": []
}
"""

def build_user_prompt(vector: HealthVector, data: HealthData) -> str:
    return f"""
健康向量：
- 自主神經負荷：{vector.autonomic_load}
- 睡眠平衡：{vector.sleep_balance}
- 活動量：{vector.activity_level}
- 血壓風險：{vector.blood_pressure_risk}

原始資料：
HRV: {data.heart_rate_variability}
睡眠: {data.sleep_hours} 小時
步數: {data.steps}
血壓: {data.systolic_bp_morning}/{data.diastolic_bp_morning}
主觀描述: {data.note}
"""

# ======================================================
# LLM 推論（安全版）
# ======================================================
def call_llm(vector: HealthVector, data: HealthData):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": PROMPT_SYSTEM},
                {"role": "user", "content": build_user_prompt(vector, data)},
            ],
        )

        content = response.choices[0].message.content

        # 嘗試解析 JSON
        try:
            return json.loads(content)
        except:
            return {
                "error": "LLM output was not valid JSON",
                "raw_output": content,
            }

    except Exception as e:
        return {
            "error": f"LLM call failed: {str(e)}",
            "raw_output": None,
        }

# ======================================================
# API
# ======================================================
@app.get("/")
def root():
    return {"message": "De-EMR Agent Ready!"}

@app.post("/vector")
def get_vector(data: HealthData):
    return encode_health_vector(data)

@app.post("/analyze")
def analyze(data: HealthData):
    vector = encode_health_vector(data)
    llm_result = call_llm(vector, data)

    result = {
        "input": data.dict(),
        "health_vector": vector.dict(),
        "analysis": llm_result,
    }

    # 寫 log
    log_path = write_log(result)
    result["log_file"] = log_path

    return result
