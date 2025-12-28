# music-ai-server/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import random
import uvicorn
import ai

app = FastAPI()

# =========================
# Request/Response models
# =========================
class EmbeddingRequest(BaseModel):
    title: str
    genre: str
    audio_path: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class SongResult(BaseModel):
    ten_bai_hat: str
    nghe_si: str
    album: str
    similarity: float

# =========================
# /api/embed (giữ nguyên)
# =========================
@app.post("/api/embed")
async def generate_embedding(data: EmbeddingRequest):
    seed_value = len(data.title) + len(data.genre)
    random.seed(seed_value)
    vector_size = 128
    embedding_vector = [random.uniform(-1, 1) for _ in range(vector_size)]
    print(f"AI Server đã xử lý thành công Embedding cho: {data.title}")
    return {"embedding": embedding_vector}

# # =========================
# # /api/search (mới)
# # =========================
# @app.post("/api/search")
# async def search_song(request: SearchRequest):
#     """
#     Mô phỏng tìm kiếm bài hát dựa trên text.
#     Trả về top_k kết quả.
#     """
#     query = request.query
    
#     #query = """khi nao lay chong"""

#     #query = "khi nao lay chong"
#     query = query.replace("\n", " ")

#     top_songs = ai.search_song(query, top_k=5)

#     return {
#         "query " : query,
#         "list_song" : top_songs

            
#             }

@app.post("/api/search")
async def search_song(request: SearchRequest):
    query = request.query.replace("\n", " ")

    # Gọi hàm AI trả về danh sách bài hát
    top_songs = ai.search_song(query, top_k=5)

    # Lọc trùng theo tên bài hát (case insensitive)
    seen_titles = set()
    unique_songs = []
    for song in top_songs:
        title_lower = song['ten_bai_hat'].lower().strip()
        if title_lower not in seen_titles:
            seen_titles.add(title_lower)
            unique_songs.append(song)

    return {
        "query": query,
        "list_song": unique_songs
    }
# =========================
# Run server
# =========================
#if __name__ == "__main__":
#    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)

# LƯU Ý: KHÔNG CẦN HÀM /api/recommend TRONG PYTHON NỮA!

# Lệnh chạy server: uvicorn main:app --reload --port 5000