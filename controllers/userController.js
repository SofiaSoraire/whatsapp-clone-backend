import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  const { nickname, bio } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // Si se envía nickname, verificar que no esté en uso por otro usuario
    if (nickname && nickname !== user.nickname) {
      const existingUser = await User.findOne({ nickname, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'El nickname ya está en uso por otro usuario' });
      }
      user.nickname = nickname;
    }
    if (bio !== undefined) {
      user.bio = bio;
    }
    await user.save();
    res.json({ id: user._id, nickname: user.nickname, email: user.email, bio: user.bio });
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchUsers = async (req, res) => {
  const { q } = req.query;
  const users = await User.find({
    $or: [{ nickname: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
    _id: { $ne: req.user._id }
  }).select('nickname email bio');
  res.json(users);
};