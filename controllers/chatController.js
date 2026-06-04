import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const getMyChats = async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'nickname bio')
    .sort({ updatedAt: -1 });
  res.json(chats);
};

export const createDirectChat = async (req, res) => {
  const { otherUserId } = req.body;
  try {
    const existing = await Chat.findOne({
      type: 'direct',
      participants: { $all: [req.user._id, otherUserId], $size: 2 }
    });
    if (existing) return res.json(existing);
    const chat = await Chat.create({
      type: 'direct',
      participants: [req.user._id, otherUserId]
    });
    res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear chat' });
  }
};
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'nickname email');
    if (!chat) return res.status(404).json({ message: 'Chat no encontrado' });
    const isParticipant = chat.participants.some(p => p._id.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'No autorizado' });
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno' });
  }
};
export const getChatMessages = async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId })
    .populate('senderId', 'nickname')
    .sort('timestamp');
  res.json(messages);
};