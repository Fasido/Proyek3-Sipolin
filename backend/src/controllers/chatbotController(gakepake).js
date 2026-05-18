import { chatbotService } from "../services/chatbotService(gakepake).js";

export const chatbotController = {
  async sendMessage(req, res) {
    try {
      const { message, chatId } = req.body;
      const userId = req.user.id; // dari middleware auth kamu

      if (!message?.trim()) {
        return res.status(400).json({ message: "Pesan tidak boleh kosong" });
      }

      const result = await chatbotService.sendMessage({ userId, message, chatId });
      return res.status(200).json(result);
    } catch (error) {
      console.error("[Chatbot] sendMessage error:", error.message);
      return res.status(500).json({ message: "Gagal memproses pesan" });
    }
  },

  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await chatbotService.getHistory(userId);
      return res.status(200).json(history ?? { messages: [] });
    } catch (error) {
      console.error("[Chatbot] getHistory error:", error.message);
      return res.status(500).json({ message: "Gagal mengambil histori" });
    }
  },
};