import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import * as geminiService from '../utils/geminiService.js';


export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide documentId',
        statusCode: 400,
      });
    }

    const requestedCount = Number(count);
    if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 30) {
      return res.status(400).json({
        success: false,
        error: 'Flashcard count must be an integer between 1 and 30',
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready',
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or not ready',
        statusCode: 404,
      });
    }

    // Generate flashcards using Gemini
    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      requestedCount
    );

    if (!cards.length) {
      return res.status(502).json({
        success: false,
        error: 'The AI could not create flashcards from this document. Try again.',
        statusCode: 502,
      });
    }

    // Save to database
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: 'Flashcards generated successfully',
    });
  } catch (error) {
    next(error);
  }
};

