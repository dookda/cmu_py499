FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 6515

# ✅ ใช้ uvicorn ที่ติดตั้งจาก requirements.txt
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "6515"]
