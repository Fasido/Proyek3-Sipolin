from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import pandas as pd
from typing import List, Dict, Optional

# Load ENV
load_dotenv()

# Load dataset tempat makan
def load_food_data():
    try:
        df = pd.read_csv('tempat_makan.csv')
        return df.to_dict('records')
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return []

# Inisialisasi FastAPI
app = FastAPI()

# Schema Request
class ChatRequest(BaseModel):
    prompt: str

def get_recommendations_by_filter(data: List[Dict], taste: Optional[str] = None, category: Optional[str] = None) -> List[Dict]:
    """
    Filter rekomendasi berdasarkan rasa (pedas/manis) atau kategori (makanan berat, dessert, dll)
    """
    recommendations = []
    
    for item in data:
        kategori = item.get('kategori', '').lower()
        menu = item.get('menu', '').lower()
        
        # Filter berdasarkan rasa
        if taste:
            if taste == 'pedas' and (kategori == 'pedas' or 'pedas' in menu):
                recommendations.append(item)
            elif taste == 'manis' and (kategori == 'manis' or 'manis' in kategori):
                recommendations.append(item)
        
        # Filter berdasarkan kategori
        elif category:
            if category in kategori or category in menu:
                recommendations.append(item)
        
        # Jika tidak ada filter, return semua
        elif not taste and not category:
            recommendations.append(item)
    
    # Urutkan berdasarkan rating tertinggi
    recommendations.sort(key=lambda x: x.get('rating', 0), reverse=True)
    
    return recommendations

def detect_intent(prompt: str):
    """
    Mendeteksi intent user: mencari rasa pedas/manis atau kategori tertentu
    """
    prompt_lower = prompt.lower()
    
    # Deteksi rasa
    if 'pedas' in prompt_lower:
        return {'type': 'taste', 'value': 'pedas'}
    elif 'manis' in prompt_lower or 'dessert' in prompt_lower:
        return {'type': 'taste', 'value': 'manis'}
    
    # Deteksi kategori makanan
    categories = {
        'makanan berat': ['berat', 'enyak', 'kenyang', 'nasi', 'ayam', 'goreng', 'bakso', 'pecel'],
        'dessert': ['dessert', 'pencuci mulut', 'manisan', 'martabak'],
        'minuman': ['minum', 'kopi', 'teh', 'jus', 'es', 'dawet'],
        'camilan': ['camilan', 'snack', 'ringan']
    }
    
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in prompt_lower:
                return {'type': 'category', 'value': category}
    
    return {'type': 'none', 'value': None}

def format_recommendations(recommendations: List[Dict], intent: Optional[dict] = None) -> str:
    """
    Format rekomendasi menjadi teks yang rapi
    """
    if not recommendations:
        if intent:
            if intent['type'] == 'taste':
                return f"Maaf, untuk makanan {intent['value']} belum tersedia di database kami.\n\nSilakan coba kata kunci lain seperti 'pedas', 'manis', atau 'makanan berat'."
            elif intent['type'] == 'category':
                return f"Maaf, untuk {intent['value']} belum tersedia di database kami.\n\nSilakan coba kategori lain seperti 'makanan berat', 'dessert', atau 'minuman'."
        return "Maaf, belum ada rekomendasi yang sesuai."
    
    # Tentukan judul berdasarkan intent
    if intent and intent['type'] == 'taste':
        title = f"🍽️ **Rekomendasi Makanan {intent['value'].upper()}**"
    elif intent and intent['type'] == 'category':
        title = f"🍽️ **Rekomendasi {intent['value'].upper()}**"
    else:
        title = "🍽️ **Semua Rekomendasi Makanan**"
    
    result = f"{title} untuk Anda:\n\n"
    
    for idx, rec in enumerate(recommendations, 1):
        result += f"{idx}. 🏠 **{rec['nama_tempat']}**\n"
        result += f"   📋 Menu: {rec['menu']}\n"
        result += f"   📍 Lokasi: {rec['lokasi']}\n"
        result += f"   ⭐ Rating: {rec['rating']}/5.0\n"
        result += f"   🏷️ Kategori: {rec['kategori']}\n\n"
    
    result += "😊 Ada yang menarik minat Anda? Coba tanyakan:\n"
    result += "• 'Makanan pedas' 🌶️\n"
    result += "• 'Makanan manis' 🍰\n"
    result += "• 'Makanan berat' 🍚\n"
    result += "• 'Minuman' ☕"
    
    return result

@app.post("/chat")
def chat_ai(data: ChatRequest):
    try:
        # Load data makanan
        food_data = load_food_data()
        
        if not food_data:
            return {
                "success": False,
                "error": "Database makanan kosong. Pastikan file tempat_makan.csv ada dan berisi data."
            }
        
        # Deteksi intent user
        intent = detect_intent(data.prompt)
        
        # Filter berdasarkan intent
        if intent['type'] == 'taste':
            recommendations = get_recommendations_by_filter(food_data, taste=intent['value'])
            response_text = format_recommendations(recommendations, intent)
        elif intent['type'] == 'category':
            recommendations = get_recommendations_by_filter(food_data, category=intent['value'])
            response_text = format_recommendations(recommendations, intent)
        else:
            # Jika tidak ada intent yang terdeteksi, beri petunjuk
            response_text = "🍽️ **Selamat datang di Food Recommendation AI!**\n\n"
            response_text += "Saya bisa membantu merekomendasikan makanan berdasarkan:\n"
            response_text += "• **Rasa**: pedas atau manis 🌶️🍰\n"
            response_text += "• **Kategori**: makanan berat, dessert, minuman, camilan 🍚🍨☕\n\n"
            response_text += "**Coba katakan:**\n"
            response_text += "• 'Aku ingin makan yang pedas'\n"
            response_text += "• 'Rekomendasi makanan manis'\n"
            response_text += "• 'Lagi laper, rekomendasiin makanan berat dong'\n"
            response_text += "• 'Ada dessert enak?'\n\n"
            response_text += "Atau lihat semua rekomendasi yang tersedia:\n\n"
            response_text += format_recommendations(food_data)
        
        # Hitung jumlah rekomendasi
        if intent['type'] == 'taste':
            total_rec = len(get_recommendations_by_filter(food_data, taste=intent['value']))
        elif intent['type'] == 'category':
            total_rec = len(get_recommendations_by_filter(food_data, category=intent['value']))
        else:
            total_rec = len(food_data)
        
        return {
            "success": True,
            "prompt": data.prompt,
            "response": response_text,
            "intent_detected": intent,
            "total_recommendations": total_rec
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/")
def root():
    return {
        "message": "AI Food Recommendation API is running!",
        "status": "active",
        "features": {
            "rasa": ["pedas", "manis"],
            "kategori": ["makanan berat", "dessert", "minuman", "camilan"]
        }
    }

@app.get("/data")
def get_all_data():
    data = load_food_data()
    return {
        "success": True,
        "data": data,
        "total": len(data)
    }