import Chat from '../models/Chat.js';
import crypto from 'crypto';
import User from '../models/User.js';

// Crear grupo (el creador es admin)
export const createGroup = async (req, res) => {
  const { groupName, participantIds } = req.body;
  const participants = [...new Set([req.user._id, ...participantIds])];
  const inviteCode = crypto.randomBytes(6).toString('hex');
  const group = await Chat.create({
    type: 'group',
    groupName,
    participants,
    adminIds: [req.user._id],
    inviteCode
  });
  res.status(201).json(group);
};

// Unirse por código
export const joinGroupByCode = async (req, res) => {
  const { code } = req.body;
  const group = await Chat.findOne({ inviteCode: code, type: 'group' });
  if (!group) return res.status(404).json({ message: 'Código inválido' });
  if (group.participants.includes(req.user._id)) return res.status(400).json({ message: 'Ya eres miembro' });
  group.participants.push(req.user._id);
  await group.save();
  res.json(group);
};

// Abandonar grupo con transferencia de admin
export const leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  const group = await Chat.findById(groupId);
  if (!group) return res.status(404).json({ message: 'Grupo no existe' });
  const userId = req.user._id;
  if (!group.participants.includes(userId)) return res.status(400).json({ message: 'No eres miembro' });

  // Si es el único admin, transferir al miembro más antiguo
  const admins = group.adminIds;
  if (admins.length === 1 && admins[0].equals(userId)) {
    const oldestMember = group.participants.find(p => !p.equals(userId));
    if (oldestMember) {
      group.adminIds = [oldestMember];
    } else {
      // Era el único miembro, eliminar grupo
      await Chat.findByIdAndDelete(groupId);
      return res.json({ message: 'Grupo eliminado por falta de administradores' });
    }
  }
  group.participants = group.participants.filter(p => !p.equals(userId));
  group.adminIds = group.adminIds.filter(a => !a.equals(userId));
  await group.save();
  res.json({ message: 'Has abandonado el grupo' });
};

// Agregar admin
export const addAdmin = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await Chat.findById(groupId);
  if (!group.adminIds.includes(req.user._id)) return res.status(403).json({ message: 'No eres admin' });
  if (!group.participants.includes(userId)) return res.status(400).json({ message: 'Usuario no es miembro' });
  if (!group.adminIds.includes(userId)) group.adminIds.push(userId);
  await group.save();
  res.json(group);
};

// Remover admin
export const removeAdmin = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await Chat.findById(groupId);
  if (!group.adminIds.includes(req.user._id)) return res.status(403).json({ message: 'No eres admin' });
  if (group.adminIds.length === 1) return res.status(400).json({ message: 'Debe haber al menos un admin' });
  group.adminIds = group.adminIds.filter(a => !a.equals(userId));
  await group.save();
  res.json(group);
};