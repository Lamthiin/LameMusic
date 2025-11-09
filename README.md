# hien

đổi database ở app.module.ts trong backend


trong terminal của frontend: npm run start


trong terminal của backend: npm run start:dev


trong terminal xử lý AI:
PS G:\Documents\2. HK1_nam4\music\music-ai-server> pip install fastapi uvicorn numpy
>> uvicorn main:app --reload --port 5000


(LƯU Ý: Bạn phải chạy lại Server FastAPI bằng lệnh uvicorn main:app --reload --port 5000 sau khi sửa file này.)

curl -X POST http://localhost:3000/ai/reindex-approved-songs -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMzLCJ1c2VybmFtZSI6Imhp4buBbiIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoidGhhbmhoaWVuMDkwMjIwMDRAZ21haWwuY29tIiwiaWF0IjoxNzYyNzE3NTA4LCJleHAiOjE3NjI4MDM5MDh9.xuW4ZLHgfgtOqq1YBPJn4x9Oslw7vBGZQof5K1phIHY" -H "Content-Type: application/json" -d "{}"
