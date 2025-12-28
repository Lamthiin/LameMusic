#!/usr/bin/env python
# coding: utf-8

# In[2]:


import re
def clean_lyrics(text):
    # 1. Chuyển hết xuống dòng thành space
    text = text.replace('\r\n', ' ').replace('\n', ' ')

    # 2. Loại bỏ các tag như [ĐK:], [RAP:], [Bridge:], [x 4]...
    text = re.sub(r'\[.*?\]', '', text)          # bỏ [ĐK:], [RAP:], ...
    text = re.sub(r'x \d+', '', text)            # bỏ x 4, x 2, ...

    # 3. Loại bỏ ký tự không phải chữ, số hoặc dấu câu cơ bản
    text = re.sub(r'[^a-zA-Z0-9À-ỹ.,!? ]+', '', text)

    # 4. Chuyển nhiều khoảng trắng thành 1 khoảng trắng
    text = re.sub(r'\s+', ' ', text).strip()

    return text


# In[3]:


import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn import tree
import matplotlib.pyplot as plt

# -----------------------
# 1. Load dataset JSON
# -----------------------
with open("dataset.json", "r", encoding="utf-8") as f:
    data= json.load(f)


# In[4]:


for item in data:
    item['noi_dung'] = clean_lyrics(item['noi_dung'])


# In[5]:


df = pd.DataFrame(data)
print(df)

df['text'] = df['ten_bai_hat'] + " " + df['noi_dung'] + " " + df['nghe_si'] 



# In[6]:


from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

# Giả sử df có cột 'text' (mo_ta + noi_dung) và 'ten_bai_hat'
model = SentenceTransformer('all-MiniLM-L6-v2')


# In[7]:


embeddings = model.encode(df['text'].tolist(), convert_to_numpy=True)


# In[8]:


def search_song(user_text, top_k=5):
    user_emb = model.encode([user_text], convert_to_numpy=True)
    sims = cosine_similarity(user_emb, embeddings)
    top_idx = sims[0].argsort()[::-1][:top_k]

    results = [
        {
            "ten_bai_hat": df.iloc[i]['ten_bai_hat'],
            "similarity": round(float(sims[0][i]), 2)  # làm tròn 2 chữ số
        }
        for i in top_idx
    ]
    return results


query = """khi nao lay chong"""

query = query.replace("\n", " ")

print(search_song(query, top_k=5))

