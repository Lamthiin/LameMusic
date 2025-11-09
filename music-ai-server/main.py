# music-ai-server/main.py (PYTHON - FastAPI - BẢN FINAL CHỈ TẠO EMBEDDING)
from fastapi import FastAPI
from pydantic import BaseModel
import random
from typing import List
import uvicorn
import os # Cần cho việc kiểm tra file (mặc dù ta không đọc file thật)

app = FastAPI()

# Cấu trúc dữ liệu nhận vào từ NestJS
class EmbeddingRequest(BaseModel):
    title: str
    genre: str
    audio_path: str # Đường dẫn vật lý (NestJS gửi để mô phỏng)

# API endpoint: Tạo embedding khi Upload
@app.post("/api/embed")
async def generate_embedding(data: EmbeddingRequest):
    """
    Mô phỏng việc tạo vector nhúng (embedding) 128 chiều.
    Đây là tác vụ mà Server Python/ML xử lý.
    """
    
    # KÍCH HOẠT QUÁ TRÌNH TẠO VECTOR (Content-Based)
    seed_value = len(data.title) + len(data.genre)
    random.seed(seed_value)
    vector_size = 128 
    
    # Tạo vector ngẫu nhiên (chỉ mô phỏng)
    embedding_vector = [random.uniform(-1, 1) for _ in range(vector_size)]
    
    # Log để kiểm tra kết nối
    print(f"AI Server đã xử lý thành công Embedding cho: {data.title}")
    
    # Trả về vector
    return {"embedding": embedding_vector}


# LƯU Ý: KHÔNG CẦN HÀM /api/recommend TRONG PYTHON NỮA!

# Lệnh chạy server: uvicorn main:app --reload --port 5000