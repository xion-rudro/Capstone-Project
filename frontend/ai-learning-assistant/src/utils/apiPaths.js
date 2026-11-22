export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },
  DOCUMENTS: {
    UPLOAD: "/api/documents/upload",
    GET_DOCUMENTS: "/api/documents",
    GET_DOCUMENT_BY_ID: (id) => `/api/documents/${id}`,
    GET_DOCUMENT_FILE: (id) => `/api/documents/${id}/file`,
    UPDATE_DOCUMENT: (id) => `/api/documents/${id}`,
    DELETE_DOCUMENT: (id) => `/api/documents/${id}`,
  },
  SUBJECTS: {
    GET_ALL: "/api/subjects",
    CREATE: "/api/subjects",
    CREATE_TOPIC: (subjectId) => `/api/subjects/${subjectId}/topics`,
  },
  AI: {
    GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
    
    EXPLAIN_CONCEPT: "/api/ai/explain-concept",
    GET_CHAT_HISTORY: (documentId) => `/api/ai/chat-history/${documentId}`,
  },
  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: "/api/flashcards",
    GET_FLASHCARDS_FOR_DOC: (documentId) => `/api/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId) => `/api/flashcards/${cardId}/review`,
    TOGGLE_STAR: (cardId) => `/api/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (id) => `/api/flashcards/${id}`,
  },
  
  PROGRESS: {
    GET_DASHBOARD: "/api/progress/dashboard",
  },
};
