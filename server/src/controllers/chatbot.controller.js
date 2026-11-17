const { chatbotService } = require('../services/chatbot/chatbot.service');
const geminiChatbotService = require('../services/chatbot/geminiChatbot.service');
const { chatMemory } = require('../services/chatbot/chatMemory');
const ApiResponse = require('../utils/ApiResponse');
const features = require('../config/features');

/**
 * Chatbot Controller
 */
const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body?.guestId || null;
    const { message } = req.body;

    let response;
    // Dispatch to Gemini AI chatbot if enabled, otherwise use rule-based Fin
    if (features.GEMINI_AI_CHAT) {
      response = await geminiChatbotService.processMessage(userId, message);
    } else {
      response = await chatbotService.processMessage(userId, message);
    }

    // Persist to memory for conversation continuity
    if (userId && message && response) {
      chatMemory.addMessage(userId, {
        sender: 'user',
        text: message,
        timestamp: new Date().toISOString(),
      });
      chatMemory.addMessage(userId, {
        sender: 'assistant',
        text: response.text,
        card: response.cards?.[0] || response.card || null,
        cards: response.cards || [],
        actionHint: response.actionHint || null,
        disclaimer: response.disclaimer || null,
        source: response.source || 'gemini_ai',
        timestamp: new Date().toISOString(),
      });
    }

    return ApiResponse.success(res, response, 'Response generated successfully');
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query?.guestId || null;
    const history = chatMemory.getHistory(userId);

    return ApiResponse.success(res, { history }, 'Chat history retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query?.guestId || null;
    chatMemory.clear(userId);

    return ApiResponse.success(res, null, 'Chat history cleared successfully');
  } catch (error) {
    next(error);
  }
};

const getStarterSuggestions = async (req, res, next) => {
  try {
    const suggestions = [
      'What is an emergency fund and how much do I need?',
      'If I invest ₹5,000 every month for 10 years at 12%?',
      'Can I afford a ₹50,000 phone right now?',
      'How is my Financial Health Score calculated?',
      'What is the difference between FD and an index fund?',
      'How does the 50-30-20 budgeting rule work?',
    ];

    return ApiResponse.success(res, { suggestions }, 'Suggestions retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory,
  getStarterSuggestions,
};
