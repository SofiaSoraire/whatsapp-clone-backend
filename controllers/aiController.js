import AIHistory from '../models/AIHistory.js';
import Message from '../models/Message.js';
import { askAboutChat } from '../services/openaiService.js';
import { logger } from '../services/loggerService.js';

export const askChat = async (req, res) => {
  const { chatId, question } = req.body;
  const userId = req.user._id;
  try {
    const messages = await Message.find({ chatId })
      .populate('senderId', 'nickname')
      .sort('-timestamp')
      .limit(50);
    const history = messages.reverse().map(m => ({
      senderName: m.senderId.nickname,
      content: m.content
    }));
    const answer = await askAboutChat(question, history);
    await AIHistory.create({ chatId, userId, question, answer });
    res.json({ answer });
  } catch (error) {
    logger.error('Error en askChat:', error);
    res.status(500).json({ message: 'Error al consultar asistente' });
  }
};

export const getAIHistory = async (req, res) => {
  const { chatId } = req.params;
  try {
    const history = await AIHistory.find({ chatId, userId: req.user._id }).sort('timestamp');
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};