# hien

đổi database ở app.module.ts trong backend


trong terminal của frontend: 
npm install
npm install vite --save-dev
npm run dev/npm run start


trong terminal của backend: npm run start:dev


trong terminal xử lý AI:
PS G:\Documents\2. HK1_nam4\music\music-ai-server> pip install fastapi uvicorn numpy
>> uvicorn main:app --reload --port 5000


(LƯU Ý: Bạn phải chạy lại Server FastAPI bằng lệnh uvicorn main:app --reload --port 5000 sau khi sửa file này.)

nhớ đổi token

curl -X POST http://localhost:3000/ai/reindex-approved-songs ^
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMzLCJ1c2VybmFtZSI6Imhp4buBbiIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoidGhhbmhoaWVuMDkwMjIwMDRAZ21haWwuY29tIiwiYXJ0aXN0SWQiOm51bGwsImlhdCI6MTc2NjgzMzcxNSwiZXhwIjoxNzY2ODM1NTE1fQ.EGp9oWGU1i29aFBuyk_iHD9MzkoSnwjlQoiygIByNgA" ^
 -H "Content-Type: application/json" ^
 -d "{}"

