import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { prompt, message } = req.body;

    const finalPrompt = prompt || message;

    if (!finalPrompt || finalPrompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Prompt tidak boleh kosong',
      });
    }

    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:8000';

    const aiResponse = await axios.post(
      `${aiBackendUrl}/chat`,
      {
        prompt: finalPrompt,
      },
      {
        timeout: 30000,
      }
    );

    return res.json({
      success: true,
      prompt: finalPrompt,
      response: aiResponse.data.response,
      intent_detected: aiResponse.data.intent_detected,
      source: aiResponse.data.source,
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'AI chatbot Sipolin sedang bermasalah. Coba lagi nanti.',
      error: error.message,
    });
  }
});

export default router;