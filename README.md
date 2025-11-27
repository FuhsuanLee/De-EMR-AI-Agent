# 🩺 De-EMR Agent  
### Personal Health Vector + LLM Reasoning + Secure Local Logging  
_A lightweight, intelligent health assistant that converts raw signals into actionable insights._

---

## 📘 Overview  
**De-EMR Agent**（Decentralized Electronic Medical Representation Agent）是一款以「健康向量 (Health Vector)」為核心、結合 LLM 進行語意推論的智能健康助理。

本系統以健康數據為基礎，建立個體化健康向量，並透過 AI 生成可理解、可行動的健康策略，同時將結果安全地寫入本地 logs，方便追蹤。

本專案適合作為：
- 健康 AI 系統原型、研究
- 競賽用 LLM Agent
- 長照或個人健康管理 assistant
- 醫療 AI demo / 教學用途

---

## 🔍 Features  
### 1. 🧠 Health Vector Encoding  
將生理數據轉換為四大健康面向：
- `autonomic_load`（自主神經負荷）
- `sleep_balance`（睡眠平衡）
- `activity_level`（活動量）
- `blood_pressure_risk`（血壓風險）

### 2. 🤖 LLM Semantic Reasoning  
使用 GPT 模型輸出：
- 健康摘要
- 潛在風險
- 風險等級：low / medium / high
- 即刻可行的短期建議
- 7 日健康策略

### 3. 📦 Secure Log Storage  
每次 `/analyze` 呼叫會自動寫入：
- 健康向量
- 使用者輸入資料
- LLM 推論結果
- timestamp

### 4. 🐳 Docker Support  
- 一行指令即可啟動
- Volume 自動同步 logs
- VM 部署、多人協作、競賽整合都超方便

---

## 🧬 System Architecture  
```bash
Health Data
↓
Health Vector Encoder
↓
LLM Semantic Engine (OpenAI / GPT Models)
↓
JSON Output + Local Logging
```
---

## 📁 Project Structure  
```bash
de-emr-agent/
│── main.py # FastAPI 主程式
│── Dockerfile # Docker 建置設定
│── requirements.txt # 套件需求
│── logs/ # 推論紀錄（不會上 GitHub）
│── .env # OpenAI API Key（不會上 GitHub）
│── .gitignore
│── README.md
```
---

## ⚙️ Environment Setup

### 1️⃣ Clone the repository  
```bash
git clone https://github.com/<YOUR_ID>/<YOUR_REPO>.git
cd de-emr-agent
```
建立 .env 檔案，並在裡面設定你的 OpenAI API Key。這是必須的，因為你的專案會需要這個來進行 LLM 推論。
```bash
OPENAI_API_KEY=你的APIKEY
```
安裝專案所需的 Python 套件：
```bash
pip install -r requirements.txt
```
啟動 FastAPI 伺服器：
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
首先，建立專案的 Docker 映像檔：
```bash
docker build -t de-emr-agent:v1 .
```
接著運行容器：
```bash
docker run -p 8000:8000 \
  -e OPENAI_API_KEY="你的APIKEY" \
  -v "$(pwd)/logs:/app/logs" \
  de-emr-agent:v1
```
