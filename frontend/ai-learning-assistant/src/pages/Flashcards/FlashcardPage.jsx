
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";

const FlashcardPage = () => {
  const { id: documentId, setId } = useParams();
  const navigate = useNavigate();

  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = useCallback(async () => {
    try {
      const response = await flashcardService.getFlashcardsForDocument(
        documentId
      );
      const sets = response.data || [];
      const activeSet = sets.find((set) => set._id === setId) || sets[0] || null;
      setFlashcardSets(activeSet);
      setFlashcards(activeSet?.cards || []);
      setCurrentCardIndex(0);
    } catch (error) {
      toast.error("Failed to fetch flashcards.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId, setId]);

  useEffect(() => {
    void Promise.resolve().then(fetchFlashcards);
  }, [documentId, fetchFlashcards]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      const response = await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      const newSetId = response.data?._id;
      if (newSetId) {
        navigate(`/documents/${documentId}/flashcards/${newSetId}`);
      } else {
        await fetchFlashcards();
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    handleReview();
    setCurrentCardIndex(
      (prevIndex) => (prevIndex + 1) % flashcards.length
    );
  };

  const handlePrevCard = () => {
    handleReview();
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
    );
  };

  const handleReview = async () => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id);
      toast.success("Flashcard reviewed!");
    } catch {
      toast.error("Failed to review flashcard.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId
            ? { ...card, isStarred: !card.isStarred }
            : card
        )
      );
      toast.success("Flashcard starred status updated!");
    } catch {
      toast.error("Failed to update star status.");
    }
  };

  const handleDeleteFlashcardSet = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      toast.success("Flashcard set deleted successfully!");
      setIsDeleteModalOpen(false);
      await fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set.");
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="No Flashcards Yet"
          description="Generate flashcards from your document to start learning."
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard
          key={currentCard._id}
            flashcard={currentCard}
            onToggleStar={handleToggleStar}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handlePrevCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            <ChevronLeft size={16} /> Previous
          </Button>

          <span className="text-sm text-neutral-600">
            {currentCardIndex + 1} / {flashcards.length}
          </span>

          <Button
            onClick={handleNextCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/documents/${documentId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Document
        </Link>
      </div>

      <PageHeader title="Flashcards">
        <div className="flex gap-2">
          {!loading && flashcards.length > 0 ? (
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={deleting}
            >
              <Trash2 size={16} /> Delete Set
            </Button>
          ) : (
            <Button
              onClick={handleGenerateFlashcards}
              disabled={generating}
            >
              {generating ? (
                <Spinner />
              ) : (
                <Plus size={16} /> 
              )}
              Generate Flashcards
            </Button>
          )}
        </div>
      </PageHeader>

      {renderFlashcardContent()}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Flashcard Set"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete all flashcards for this document?
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDeleteFlashcardSet}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FlashcardPage;
