from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load ENV
load_dotenv()


API_KEY = os.getenv("AIzaSyCklkeQ1EaWp4Vkp6X9vzuMKH_x_hUjAuk")

genai.configure(api_key=API_KEY)

# Model AI
model = genai.GenerativeModel("gemini-3.1-flash-lite")

# Inisialisasi FastAPI
app = FastAPI()

# Schema Request
class ChatRequest(BaseModel):
    prompt: str

# Endpoint Chat
@app.post("/chat")
def chat_ai(data: ChatRequest):
    try:
        response = model.generate_content(data.prompt)

        return {
            "success": True,
            "prompt": data.prompt,
            "response": response.text
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }