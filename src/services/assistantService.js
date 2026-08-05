import api from './api';

export const sendChatMessage = async (message, contextData) => {
  try {
    const response = await api.post('/assistant/chat/', {
      message: message,
      context: contextData
    });
    
    if (response.data && response.data.success) {
      return { success: true, text: response.data.response };
    } else {
      return { success: false, text: response.data?.error || "Failed to parse response." };
    }
  } catch (error) {
    console.error("AI Assistant API Error:", error);
    // Explicitly mask API internal errors to be user-friendly per the design constraints
    return { 
      success: false, 
      text: "The AI Assistant is temporarily unavailable. Please try again in a few moments." 
    };
  }
};
