import axios from 'axios';

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || 'http://localhost:8000';

const authHeader = () => {
  const token = localStorage.getItem('meetra_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const sendChatMessage = async ({ workspaceId, message }) => {
  const res = await axios.post(
    `${CHATBOT_URL}/chat`,
    { workspace_id: workspaceId, message },
    { headers: authHeader() },
  );
  return res.data.reply;
};

export const clearChatSession = async ({ workspaceId }) => {
  await axios.post(
    `${CHATBOT_URL}/chat/clear`,
    { workspace_id: workspaceId },
    { headers: authHeader() },
  );
};
