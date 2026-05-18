// import anthropic from "../lib/anthropic.js";
// import prisma from "../lib/prisma.js";

// const SYSTEM_PROMPT = `Kamu adalah asisten rekomendasi tempat makan di sekitar kampus.
// Ketika user menyebut makanan yang ingin dibeli, rekomendasikan 2-3 tempat makan terdekat.
// Selalu balas HANYA dalam format JSON berikut, tanpa teks tambahan apapun:
// {
//   "reply": "teks percakapan natural di sini",
//   "recommendations": [
//     {
//       "name": "Nama Warung/Resto",
//       "address": "Alamat singkat",
//       "distance": "estimasi jarak dari kampus",
//       "notes": "alasan direkomendasikan"
//     }
//   ]
// }
// Jika user tidak menyebut makanan spesifik, isi recommendations dengan array kosong [].`;

// export const chatbotService = {
//   async sendMessage({ userId, message, chatId }) {
//     // 1. Ambil histori chat kalau chatId dikirim
//     let chat = null;
//     if (chatId) {
//       chat = await prisma.aiChat.findUnique({ where: { id: chatId } });
//     }

//     const history = Array.isArray(chat?.messages) ? chat.messages : [];

//     // 2. Susun messages untuk dikirim ke Claude
//     const updatedMessages = [
//       ...history,
//       { role: "user", content: message },
//     ];

//     // 3. Panggil Claude
//     const response = await anthropic.messages.create({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 1024,
//       system: SYSTEM_PROMPT,
//       messages: updatedMessages,
//     });

//     const aiText = response.content[0].text;

//     // 4. Simpan histori ke DB
//     const finalMessages = [
//       ...updatedMessages,
//       { role: "assistant", content: aiText },
//     ];

//     const savedChat = chat
//       ? await prisma.aiChat.update({
//           where: { id: chat.id },
//           data: { messages: finalMessages },
//         })
//       : await prisma.aiChat.create({
//           data: { userId, messages: finalMessages },
//         });

//     // 5. Parse JSON dari Claude dan return
//     const parsed = JSON.parse(aiText);
//     return { ...parsed, chatId: savedChat.id };
//   },

//   async getHistory(userId) {
//     const chat = await prisma.aiChat.findFirst({
//       where: { userId },
//       orderBy: { createdAt: "desc" },
//     });
//     return chat;
//   },
// };