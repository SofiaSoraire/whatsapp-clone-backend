import OpenAI from 'openai';
import { logger } from './loggerService.js';

let openai = null;

// Intentar inicializar OpenAI solo si la clave está presente
const apiKey = process.env.OPENAI_API_KEY;
if (apiKey && apiKey.trim() !== '' && apiKey !== 'sk-proj-...') {
  try {
    openai = new OpenAI({ apiKey: apiKey.trim() });
    logger.info('✅ OpenAI inicializado correctamente');
  } catch (error) {
    logger.error('❌ Error al inicializar OpenAI:', error.message);
  }
} else {
  logger.warn('⚠️ OPENAI_API_KEY no encontrada o inválida en .env');
}

export const askAboutChat = async (question, messagesHistory) => {
  // Simula una respuesta inteligente basada en el contexto
  const messageCount = messagesHistory.length;
  const lastMessages = messagesHistory.slice(-3).map(m => `${m.senderName}: ${m.content}`).join('\n');
  
  let answer = `🤖 *Asistente (modo simulación)*\n\n`;
  answer += `Recibí tu pregunta: "${question}".\n`;
  answer += `He analizado los últimos ${messageCount} mensajes del chat.\n`;
  if (messageCount > 0) {
    answer += `\n*Resumen rápido:*\n${lastMessages}\n`;
    answer += `\n(Para respuestas reales con IA, necesitarías una clave de OpenAI válida.)`;
  } else {
    answer += `\nTodavía no hay mensajes en este chat. ¡Envía algunos para que pueda analizarlos!`;
  }
  return answer;
};