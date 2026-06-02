import csv
import re
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
                # Tambahkan sub_kategori dengan default kosong jika tidak ada
                sub_kategori = row.get("sub_kategori", "")
                
                data.append({
                    "id": row["id"],
                    "nama_tempat": row["nama_tempat"],
                    "kategori": row["kategori"],
                    "sub_kategori": sub_kategori,
                    "menu": row["menu"],
                    "lokasi": row["lokasi"],
                    "rating": float(row["rating"])
                })

    except Exception as e:
        print(f"[CSV] Error membaca file: {e}")

    return data

def detect_kategori_from_prompt(prompt: str) -> Optional[str]:
    """Deteksi kategori makanan dari prompt dengan lebih fleksibel"""
    prompt = prompt.lower()
    
    # DETEKSI MINUMAN - DIPERKUAT BANGET!
    minuman_keywords = [
        "minuman", "minum", "haus", "ngopi", "kopi", "teh", "jus",
        "es", "segar", "seger", "dingin", "hangat", "panas",
        "es teh", "es kopi", "soda", "air putih", "air mineral",
        "boba", "thai tea", "matcha", "cincau", "wedang", "bandrek",
        "secang", "jahe", "smoothie", "milkshake", "frappe",
        "lega", "dahaga", "butuh minum", "haus banget",
        "minuman dingin", "minuman hangat", "minuman segar",
        "dingin dingin", "dingin-dingin"
    ]
    
    # Mapping kata kunci ke kategori
    kategori_mapping = {
        # Pedas
        "pedas": "pedas",
        "pedes": "pedas",
        "spicy": "pedas",
        "cabe": "pedas",
        "sambal": "pedas",
        "geprek": "pedas",
        "mercon": "pedas",
        
        # Manis
        "manis": "manis",
        "sweet": "manis",
        "gula": "manis",
        "coklat": "manis",
        "chocolate": "manis",
        
        # Asin / Gurih
        "asin": "asin",
        "gurih": "asin",
        "sedap": "asin",
        "savory": "asin",
        "umami": "asin",
        
        # Dessert
        "dessert": "dessert",
        "cemilan manis": "dessert",
        "kue": "dessert",
        "cake": "dessert",
        
        # Makanan berat
        "lapar": "asin",
        "kenyang": "asin",
        "nasi": "asin",
        "bakso": "asin",
        "soto": "asin",
        "rendang": "asin"
    }
    
    # Cek minuman dulu (prioritas tinggi)
    for keyword in minuman_keywords:
        if keyword in prompt:
            print(f"[DEBUG] Keyword minuman terdeteksi: '{keyword}'")
            return "minuman"
    
    # Cek kategori lain
    for keyword, kategori in kategori_mapping.items():
        if keyword in prompt:
            print(f"[DEBUG] Keyword '{keyword}' terdeteksi -> kategori '{kategori}'")
            return kategori
    
    return None

def detect_subkategori_from_prompt(prompt: str) -> Optional[str]:
    """Deteksi subkategori (berkuah/goreng/dingin/hangat) dari prompt - LEBIH FLEKSIBEL"""
    prompt = prompt.lower()
    
    # DETEKSI MINUMAN DINGIN - DIPERKUAT!
    minuman_dingin_keywords = [
        # Kata dasar
        "dingin", "dingin-dingin", "dingin dingin", "dinginin",
        "es", "cold", "ice", 
        "segar", "seger", "segerrr", "segar-segar", "nyegerin",
        "dinginnya", "kedinginan",
        
        # Minuman spesifik dingin
        "es teh", "es kopi", "es jeruk", "es kelapa", "es campur",
        "es cendol", "es dawet", "es krim", "milkshake", "smoothie",
        "boba", "bubble tea", "ice tea", "ice coffee", "frappe",
        "thai tea", "matcha dingin", "jus dingin", "soda dingin",
        
        # Frasa umum
        "yang dingin", "minuman dingin", "dinginnya", "bikin seger",
        "pendingin", "pelepas dahaga", "haus banget", "lagi haus"
    ]
    
    # DETEKSI MINUMAN HANGAT - DIPERKUAT!
    minuman_hangat_keywords = [
        "hangat", "panas", "hot", "warm", "anget",
        "wedang", "bandrek", "secang", "jahe", "teh hangat",
        "kopi panas", "kopi hitam", "teh panas", "susu hangat",
        "coklat panas", "hot chocolate", "chocolate panas",
        "yang hangat", "minuman hangat", "angetan", "penghangat",
        "cuaca dingin", "hujan", "dingin-dingin hangat"
    ]
    
    # DETEKSI BERKUAH
    berkuah_keywords = [
        "berkuah", "kuah", "berempah", "soto", "bakso", "rawon",
        "seblak", "mie rebus", "sop", "berkuahnya", "berkuah kental",
        "berempah", "berkaldu"
    ]
    
    # DETEKSI GORENG/KERING
    goreng_keywords = [
        "goreng", "kering", "crispy", "renyah", "kriuk", "keripik",
        "geprek", "bakwan", "gorengan", "keringnya", "renyahnya",
        "kriuk kriuk", "kriuk-kriuk"
    ]
    
    # Cek minuman dingin (prioritas tinggi)
    for keyword in minuman_dingin_keywords:
        if keyword in prompt:
            print(f"[DEBUG] Keyword minuman dingin terdeteksi: '{keyword}'")
            return "minuman_dingin"
    
    # Cek minuman hangat
    for keyword in minuman_hangat_keywords:
        if keyword in prompt:
            print(f"[DEBUG] Keyword minuman hangat terdeteksi: '{keyword}'")
            return "minuman_hangat"
    
    # Cek makanan berkuah
    for keyword in berkuah_keywords:
        if keyword in prompt:
            print(f"[DEBUG] Keyword berkuah terdeteksi: '{keyword}'")
            return "berkuah"
    
    # Cek makanan goreng
    for keyword in goreng_keywords:
        if keyword in prompt:
            print(f"[DEBUG] Keyword goreng terdeteksi: '{keyword}'")
            return "goreng"
    
    return None

def rekomendasi_makanan(prompt: str):
    """Rekomendasi makanan dengan filter subkategori - LEBIH FLEKSIBEL"""
    kategori = detect_kategori_from_prompt(prompt)
    sub_kategori = detect_subkategori_from_prompt(prompt)
    
    print(f"[DEBUG] Detected: kategori={kategori}, sub_kategori={sub_kategori}")
    
    if not kategori:
        return None
    
    data = load_tempat_makan()
    
    # Log semua data minuman untuk debugging
    if kategori == "minuman":
        minuman_data = [item for item in data if item["kategori"] == "minuman"]
        print(f"[DEBUG] Total minuman di database: {len(minuman_data)}")
        for m in minuman_data:
            print(f"   - {m['nama_tempat']} ({m['sub_kategori']})")
    
    # Filter berdasarkan kategori
    hasil = [
        item
        for item in data
        if item["kategori"] == kategori
    ]
    
    print(f"[DEBUG] Setelah filter kategori: {len(hasil)} item")
    
    # Filter berdasarkan subkategori jika ada DAN jika hasil tidak kosong
    if sub_kategori and hasil:
        hasil_sub = [
            item
            for item in hasil
            if item["sub_kategori"] == sub_kategori
        ]
        if hasil_sub:
            hasil = hasil_sub
            print(f"[DEBUG] Setelah filter sub_kategori '{sub_kategori}': {len(hasil)} item")
        else:
            print(f"[DEBUG] Tidak ada item dengan sub_kategori '{sub_kategori}', pakai semua hasil")
    
    # Fallback untuk minuman
    if not hasil and kategori == "minuman":
        print(f"[DEBUG] Fallback: ambil semua minuman")
        hasil = [item for item in data if item["kategori"] == "minuman"]
    
    # Fallback untuk kategori lain
    if not hasil:
        if kategori == "asin":
            hasil = [item for item in data if item["kategori"] in ["asin", "makanan berat"]]
        elif kategori == "manis":
            hasil = [item for item in data if item["kategori"] in ["manis", "dessert"]]
    
    return hasil

def format_rekomendasi(kategori: str, data: list, sub_kategori: str = None):
    """Format rekomendasi dengan informasi subkategori"""
    if not data:
        return "Maaf, aku belum menemukan rekomendasi yang cocok untuk kategori ini."

    # Mapping intro berdasarkan kategori dan subkategori
    intro_map = {
        "pedas": {
            "berkuah": "🍜 Lagi pengen **pedas berkuah**? Ini rekomendasinya:",
            "goreng": "🍗 Lagi pengen **pedas gorengan**? Cek ini yuk:",
            "default": "🌶️ Kalau lagi pengen makanan pedas, ini rekomendasinya:"
        },
        "manis": {
            "berkuah": "🥣 Lagi pengen yang **manis berkuah**? Ini pilihannya:",
            "goreng": "🍩 Lagi pengen **manis gorengan**? Coba ini:",
            "default": "🍰 Kalau lagi cari yang manis, ini pilihannya:"
        },
        "asin": {
            "berkuah": "🍲 Lagi pengen **makanan berkuah** yang gurih? Ini rekomendasinya:",
            "goreng": "🍟 Lagi pengen **gorengan renyah** yang gurih? Cek ini:",
            "default": "🍛 Kalau lagi pengen makanan asin/gurih, ini rekomendasinya:"
        },
        "minuman": {
            "minuman_dingin": "🥤❄️ Lagi **haus** dan butuh yang **dingin & segar**? Cek rekomendasi ini:",
            "minuman_hangat": "☕🔥 Lagi pengen yang **hangat & nikmat**? Cobain yuk:",
            "default": "🥤 Ada yang haus? Cek rekomendasi minuman ini:"
        },
        "dessert": {
            "berkuah": "🥣 Lagi pengen dessert yang **berkuah**? Ini pilihannya:",
            "goreng": "🍩 Lagi pengen dessert **gorengan**? Coba ini:",
            "default": "🍮 Kalau lagi pengen dessert, ini rekomendasinya:"
        }
    }
    
    # Pilih intro yang sesuai
    kategori_intro = intro_map.get(kategori, {})
    
    if sub_kategori and sub_kategori in kategori_intro:
        response = kategori_intro[sub_kategori]
    else:
        response = kategori_intro.get("default", f"🍽️ Rekomendasi {kategori}:")
    
    response += "\n\n"
    
    # Sort by rating
    data_sorted = sorted(data, key=lambda x: x["rating"], reverse=True)
    
    # Tampilkan top 5 rekomendasi
    for i, item in enumerate(data_sorted[:5], 1):
        response += (
            f"{i}. **{item['nama_tempat']}** ⭐ {item['rating']}\n"
            f"   📍 {item['lokasi']} | 🍽️ {item['menu']}\n"
        )
        
        # Tambahkan info subkategori
        if item["sub_kategori"] == "berkuah":
            response += f"   💧 Makanan berkuah\n"
        elif item["sub_kategori"] == "goreng":
            response += f"   🔥 Gorengan/crispy\n"
        elif item["sub_kategori"] == "minuman_dingin":
            response += f"   ❄️ Minuman dingin & segar\n"
        elif item["sub_kategori"] == "minuman_hangat":
            response += f"   🔥 Minuman hangat\n"
        
        response += "\n"
    
    # Tambahkan rekomendasi terbaik
    if data_sorted:
        terbaik = data_sorted[0]
        response += (
            f"✨ **Rekomendasi teratas**: {terbaik['nama_tempat']} "
            f"dengan rating {terbaik['rating']} ⭐\n"
        )
        
        if kategori == "minuman":
            if terbaik["sub_kategori"] == "minuman_dingin":
                response += f"   🥤 Cocok diminum saat siang hari yang panas!"
            elif terbaik["sub_kategori"] == "minuman_hangat":
                response += f"   ☕ Cocok diminum saat malam atau cuaca dingin!"
        
        response += f"\n   Menu andalan: {terbaik['menu']} di {terbaik['lokasi']}"
    
    return response

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
        
        if hasil_rekomendasi and len(hasil_rekomendasi) > 0:
            kategori = hasil_rekomendasi[0]["kategori"]
            sub_kategori = detect_subkategori_from_prompt(prompt)
            response_text = format_rekomendasi(kategori, hasil_rekomendasi, sub_kategori)
            
            return {
                "success": True,
                "prompt": prompt,
                "response": response_text,
                "source": "csv",
                "kategori": kategori,
                "sub_kategori": sub_kategori,
                "total_rekomendasi": len(hasil_rekomendasi),
                "data": hasil_rekomendasi[:5]
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
        "total": len(load_tempat_makan()),
        "data": load_tempat_makan()
    }