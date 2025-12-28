import pymysql
import pandas as pd
import json

# -----------------------
# Kết nối MySQL
# -----------------------
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='root',
    database='musicdb',
    charset='utf8mb4'
)

# -----------------------
# Truy vấn dữ liệu
# -----------------------
query = """
SELECT 
    s.title AS ten_bai_hat,
    l.lyrics AS noi_dung,
    a.stage_name AS nghe_si
FROM musicdb.song s
JOIN musicdb.songartist sa ON s.id = sa.song_id
JOIN musicdb.artist a ON sa.artist_id = a.id
JOIN musicdb.lyrics l ON s.id = l.song_id;

"""
df = pd.read_sql(query, conn)

# -----------------------
# Xuất ra JSON
# -----------------------
dataset = df.to_dict(orient='records')

with open('dataset.json', 'w', encoding='utf-8') as f:
    json.dump(dataset, f, ensure_ascii=False, indent=4)

print("Đã tạo dataset.json với", len(dataset), "bài hát.")
