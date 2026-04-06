import axios from 'axios';

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || 'http://localhost:8000';

export const sendChatMessage = async ({ workspaceId, userId, message }) => {
  const res = await axios.post(`${CHATBOT_URL}/chat`, {
    workspace_id: workspaceId,
    user_id: userId,
    message,
  });
  return res.data.reply;
};

export const clearChatSession = async ({ workspaceId, userId }) => {
  await axios.post(`${CHATBOT_URL}/chat/clear`, {
    workspace_id: workspaceId,
    user_id: userId,
  });
};
