import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPaths';

const generateFlashcards = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      { documentId, ...options }
    );
    return response.data;
  } catch (error) {
    const responseError = error.response?.data;
    throw new Error(
      responseError?.error ||
        responseError?.message ||
        error.message ||
        'Failed to generate flashcards'
    );
  }
};


const aiService = {
  generateFlashcards,
  
};

export default aiService;
