import Message from '../models/Message.js';

export const createMessage = async (req, res) => {
  const { chatId, content } = req.body;
  try {
    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      content
    });
    const populated = await message.populate('senderId', 'nickname');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chatId })
      .populate('senderId', 'nickname')
      .sort('timestamp');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
};