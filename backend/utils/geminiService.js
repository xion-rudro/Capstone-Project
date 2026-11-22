import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
Return a JSON array. Each item must have a clear "question", concise "answer", and "difficulty" set to "easy", "medium", or "hard".

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              answer: { type: 'STRING' },
              difficulty: {
                type: 'STRING',
                enum: ['easy', 'medium', 'hard'],
              },
            },
            required: ['question', 'answer', 'difficulty'],
          },
        },
      },
    });

    const generatedText = response.text;
    if (!generatedText) {
      throw new Error('Gemini returned an empty flashcard response');
    }

    const flashcards = JSON.parse(generatedText);
    if (!Array.isArray(flashcards)) {
      throw new Error('Gemini returned flashcards in an invalid format');
    }

    return flashcards
      .filter(
        (card) =>
          typeof card.question === 'string' &&
          card.question.trim() &&
          typeof card.answer === 'string' &&
          card.answer.trim()
      )
      .map((card) => ({
        question: card.question.trim(),
        answer: card.answer.trim(),
        difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty)
          ? card.difficulty
          : 'medium',
      }))
      .slice(0, count);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate flashcards');
  }
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array<string>, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Create exactly ${numQuestions} multiple choice questions using only the source text below.
Each question must have four distinct answer options. Set correctAnswer to exactly one of the options. Include a short explanation and a difficulty of easy, medium, or hard.

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctAnswer: { type: 'STRING' },
              explanation: { type: 'STRING' },
              difficulty: {
                type: 'STRING',
                enum: ['easy', 'medium', 'hard'],
              },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation', 'difficulty'],
          },
        },
      },
    });

    const generatedText = response.text;
    if (!generatedText) {
      throw new Error('Gemini returned an empty quiz response');
    }

    const generatedQuestions = JSON.parse(generatedText);
    if (!Array.isArray(generatedQuestions)) {
      throw new Error('Gemini returned quiz questions in an invalid format');
    }

    return generatedQuestions
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const options = Array.isArray(item.options)
          ? item.options
            .filter((option) => typeof option === 'string')
            .map((option) => option.trim())
            .filter(Boolean)
          : [];
        const correctAnswer = typeof item.correctAnswer === 'string'
          ? options.find((option) => option.toLowerCase() === item.correctAnswer.trim().toLowerCase())
          : undefined;

        if (
          typeof item.question !== 'string' ||
          !item.question.trim() ||
          options.length !== 4 ||
          new Set(options.map((option) => option.toLowerCase())).size !== 4 ||
          !correctAnswer
        ) {
          return null;
        }

        return {
          question: item.question.trim(),
          options,
          correctAnswer,
          explanation: typeof item.explanation === 'string' ? item.explanation.trim() : '',
          difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty)
            ? item.difficulty
            : 'medium',
        };
      })
      .filter(Boolean)
      .slice(0, numQuestions);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate quiz');
  }
};

/**
 * Generate a concise summary of text
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important details.
Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate summary');
  }
};

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join('\n\n');

  const prompt = `Based on the following context from a document, analyze the context and answer the user's question accurately.
If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process chat request');
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
Provide a clear, educational explanation that's easy to understand.
Include examples if relevant.

Context:
${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to explain concept');
  }
};
