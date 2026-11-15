/**
 * In-memory Chatbot Conversation Memory
 * Stores the last 5 turns (user + Fin) per user for context continuity.
 */

class ChatMemory {
  constructor(maxTurns = 5) {
    this.maxTurns = maxTurns;
    this.sessions = new Map(); // userId -> [{ sender, text, timestamp }]
  }

  getHistory(userId) {
    if (!userId) return [];
    return this.sessions.get(userId.toString()) || [];
  }

  addMessage(userId, sender, text, meta = {}) {
    if (!userId) return;
    const key = userId.toString();
    const history = this.sessions.get(key) || [];
    history.push({
      sender,
      text,
      meta,
      timestamp: new Date().toISOString(),
    });

    // Keep only last N * 2 messages (N turns)
    const maxMessages = this.maxTurns * 2;
    if (history.length > maxMessages) {
      history.splice(0, history.length - maxMessages);
    }

    this.sessions.set(key, history);
  }

  clear(userId) {
    if (!userId) return;
    this.sessions.delete(userId.toString());
  }
}

const chatMemory = new ChatMemory(5);
module.exports = { chatMemory, ChatMemory };
