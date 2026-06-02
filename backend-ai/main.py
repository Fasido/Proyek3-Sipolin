import csv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
import os

try:
    from google import genai
except Exception as e:
    print(f"[AI] Gagal import google-genai: {e}")
    genai = None


load_dotenv()

app = FastAPI(
    title="Sipolin AI Chatbot API",
    description="AI chatbot untuk aplikasi Sipolin",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    prompt: str


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None

MODEL_CANDIDATES = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-flash-latest",
]

if genai and GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        print("[AI] Gemini aktif pakai google-genai")
    except Exception as e:
        print(f"[AI] Gemini gagal dibuat client: {e}")
        client = None
else:
    print("[AI] Gemini tidak aktif. Cek GEMINI_API_KEY di .env atau package google-genai")


SIPOLIN_CONTEXT = """
Kamu adalah AI Sipolin, asisten digital di aplikasi Sipolin.

Tentang Sipolin:
Sipolin adalah aplikasi layanan digital untuk membantu kebutuhan mahasiswa atau pengguna,
terutama untuk antar jemput, kirim barang, dan titip beli atau titip ambil barang.

Fitur utama:

1. Pol-Ride
Layanan antar jemput atau transportasi. User memilih lokasi jemput dan lokasi tujuan,
lalu membuat pesanan perjalanan.

2. Pol-Send
Layanan pengiriman barang. Cocok untuk mengirim dokumen, paket kecil, makanan,
atau barang lain.

3. Nitip
Layanan titip beli atau titip ambil. Contohnya nitip beli makanan, minuman,
atau mengambil barang tertentu.

4. Chat
Digunakan untuk komunikasi antara user dan driver saat pesanan berjalan.

5. Histori
Digunakan untuk melihat riwayat pesanan.

6. Profil
Digunakan untuk melihat dan mengatur data akun.

Gaya jawaban:
- Pakai bahasa Indonesia santai.
- Jangan kaku seperti template.
- Jawab natural seperti asisten aplikasi.
- Kalau user tanya cara pakai, kasih langkah singkat.
- Kalau user bingung memilih fitur, bantu rekomendasikan fitur yang paling cocok.
- Jangan mengarang data driver, harga, status pesanan, atau data database kalau tidak dikasih.
"""
CSV_FILE = "tempat_makan.csv"

def detect_intent(prompt: str) -> str:
    text = prompt.lower()

    if any(k in text for k in ["pol ride", "pol-ride", "polride", "ride", "antar", "jemput", "ojek"]):
        return "pol_ride"

    if any(k in text for k in ["pol send", "pol-send", "polsend", "send", "kirim", "barang", "paket", "dokumen"]):
        return "pol_send"

    if any(k in text for k in ["nitip", "titip", "belikan", "beliin", "ambilkan", "ambilin"]):
        return "nitip"

    if any(k in text for k in ["history", "histori", "riwayat"]):
        return "history"

    if any(k in text for k in ["chat", "driver"]):
        return "chat"

    if any(k in text for k in ["profil", "profile", "akun"]):
        return "profile"

    if any(k in text for k in ["halo", "hai", "hello", "pagi", "siang", "sore", "malam"]):
        return "greeting"

    return "general"


def local_fallback(prompt: str, intent: str) -> str:
    if intent == "greeting":
        return "Halo! Aku AI Sipolin. Kamu bisa tanya soal Pol-Ride, Pol-Send, Nitip, Chat, Histori, atau Profil."

    if intent == "pol_ride":
        return "Pol-Ride itu fitur antar jemput di Sipolin. Kamu tinggal pilih lokasi jemput, tujuan, lalu buat pesanan."

    if intent == "pol_send":
        return "Pol-Send itu fitur buat kirim barang, seperti dokumen, paket kecil, makanan, atau barang lain."

    if intent == "nitip":
        return "Nitip itu fitur buat minta bantuan beliin atau ambilin sesuatu, misalnya makanan atau barang tertentu."

    if intent == "history":
        return "Menu Histori dipakai buat melihat riwayat pesanan yang pernah kamu buat."

    if intent == "chat":
        return "Menu Chat dipakai buat komunikasi dengan driver saat pesanan sedang berjalan."

    if intent == "profile":
        return "Menu Profil dipakai buat melihat dan mengatur data akun kamu."

    return "Aku AI Sipolin. Aku bisa bantu jelasin fitur Pol-Ride, Pol-Send, Nitip, Chat, Histori, dan cara pakai aplikasi Sipolin."


def generate_with_gemini(prompt: str) -> Optional[dict]:
    if not client:
        return None

    full_prompt = f"""
{SIPOLIN_CONTEXT}

Pertanyaan user:
"{prompt}"

Jawab secara natural, singkat, jelas, dan membantu.
Jangan jawab seperti template tetap.
"""

    for model_name in MODEL_CANDIDATES:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=full_prompt
            )

            if response and response.text:
                return {
                    "text": response.text.strip(),
                    "model": model_name
                }

        except Exception as e:
            print(f"[AI] Model gagal: {model_name} -> {e}")

    return None

def load_tempat_makan():
    data = []

    try:
        with open(CSV_FILE, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            for row in reader:
                data.append({
                    "id": row["id"],
                    "nama_tempat": row["nama_tempat"],
                    "kategori": row["kategori"],
                    "menu": row["menu"],
                    "lokasi": row["lokasi"],
                    "rating": row["rating"]
                })

    except Exception as e:
        print(f"[CSV] Error membaca file: {e}")

    return data

def rekomendasi_makanan(prompt: str):
    prompt = prompt.lower()

    data = load_tempat_makan()

    kategori_map = {
        "pedas": "pedas",
        "manis": "manis",
        "dessert": "dessert",
        "minuman": "minuman",
        "makanan berat": "makanan berat"
    }

    kategori_ditemukan = None

    for keyword, kategori in kategori_map.items():
        if keyword in prompt:
            kategori_ditemukan = kategori
            break

    if not kategori_ditemukan:
        return None

    return [
        item
        for item in data
        if item["kategori"].lower() == kategori_ditemukan
    ]

@app.post("/chat")
def chat_ai(data: ChatRequest):
    try:
        prompt = data.prompt.strip()

        if not prompt:
            return {
                "success": False,
                "error": "Prompt tidak boleh kosong."
            }

        # Cek rekomendasi makanan dari CSV
        hasil_rekomendasi = rekomendasi_makanan(prompt)

        if hasil_rekomendasi:
            response_text = "Aku rekomendasikan:\n\n"

            for item in hasil_rekomendasi:
                response_text += (
                    f"- {item['nama_tempat']} "
                    f"({item['menu']}) "
                    f"di {item['lokasi']} "
                    f"dengan rating {item['rating']}\n"
                )

            return {
                "success": True,
                "prompt": prompt,
                "response": response_text,
                "source": "csv",
                "data": hasil_rekomendasi
            }

        intent = detect_intent(prompt)
        ai_result = generate_with_gemini(prompt)

        if ai_result:
            response_text = ai_result["text"]
            source = "gemini"
            model_name = ai_result["model"]
        else:
            response_text = local_fallback(prompt, intent)
            source = "local_fallback"
            model_name = None

        return {
            "success": True,
            "prompt": prompt,
            "response": response_text,
            "intent_detected": {
                "type": intent,
                "value": intent
            },
            "source": source,
            "model": model_name
        }

    except Exception as e:
        print(f"[AI] Chat error: {e}")

        return {
            "success": False,
            "error": str(e)
        }


@app.get("/")
def root():
    return {
        "message": "AI Chatbot Sipolin API is running!",
        "status": "active",
        "gemini_api_key_found": bool(GEMINI_API_KEY),
        "gemini_client_active": client is not None,
        "model_candidates": MODEL_CANDIDATES
    }


@app.get("/debug")
def debug():
    return {
        "google_genai_imported": genai is not None,
        "gemini_api_key_found": bool(GEMINI_API_KEY),
        "gemini_client_active": client is not None,
        "model_candidates": MODEL_CANDIDATES
    }


@app.get("/data")
def get_all_data():
    return {
        "success": True,
        "data": {
            "app_name": "Sipolin",
            "description": "Aplikasi layanan digital dengan fitur Pol-Ride, Pol-Send, dan Nitip.",
            "services": [
                {
                    "name": "Pol-Ride",
                    "description": "Layanan antar jemput atau transportasi."
                },
                {
                    "name": "Pol-Send",
                    "description": "Layanan pengiriman barang atau dokumen."
                },
                {
                    "name": "Nitip",
                    "description": "Layanan titip beli atau titip ambil barang."
                }
            ]
        }
    }

@app.get("/tempat-makan")
def get_tempat_makan():
    return {
        "success": True,
        "data": load_tempat_makan()
    }