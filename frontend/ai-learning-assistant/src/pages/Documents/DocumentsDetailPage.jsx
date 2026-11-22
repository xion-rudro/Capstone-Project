import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";

import ChatInterface from "../../components/Chat/ChatInterface";
import AIActions from "../../components/ai/AiAction";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";

const DocumentDetailPage = () => {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  
  useEffect(() => {
    let active = true;
    let timer;

    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        if (!active) return;
        setDocument(data);
        setLoading(false);
        if (data.data?.status === "processing") {
          timer = window.setTimeout(fetchDocumentDetails, 1500);
        }
      } catch (error) {
        if (active) {
          toast.error("Failed to fetch document details.");
          console.error(error);
          setLoading(false);
        }
      }
    };

    fetchDocumentDetails();

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [id]);

  // Load the private PDF with the same authorization header as the rest of the API.
  useEffect(() => {
    if (!document?.data?._id) return undefined;

    let active = true;
    let objectUrl;
    setPdfUrl(null);
    setPdfLoading(true);

    documentService.getDocumentFile(id)
      .then((fileBlob) => {
        objectUrl = URL.createObjectURL(fileBlob);
        if (active) setPdfUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch((error) => {
        if (active) {
          toast.error(error?.message || error?.error || "Failed to load the PDF.");
        }
      })
      .finally(() => {
        if (active) setPdfLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document?.data?._id, id]);

  // Render Document Content
  const renderContent = () => {
    if (!document?.data?.fileId && !document?.data?.filePath) {
      return (
        <div className="p-6 text-center text-slate-500">
          PDF not available.
        </div>
      );
    }

    return (
      <div className="document-viewer bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* PDF Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-700">
            Document Viewer
          </span>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ExternalLink size={16} />
              Open in new tab
            </a>
          )}
        </div>

        {/* PDF Viewer */}
        {pdfLoading ? (
          <div className="document-viewer-loading">Loading PDF…</div>
        ) : pdfUrl ? (
          <div className="document-viewer-frame">
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="PDF Viewer"
              frameBorder="0"
              style={{ colorScheme: "light" }}
            />
          </div>
        ) : (
          <div className="document-viewer-loading">PDF unavailable.</div>
        )}
      </div>
    );
  };

  // Render Chat Tab
  const renderChat = () => {
    return <ChatInterface />;
  };

  // Render AI Actions Tab
  const renderAIActions = () => {
    return <AIActions />;
  };

  // Render Flashcards Tab
  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id} />;
  };

  // Render Quizzes Tab
  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />;
  };

  // Tabs Configuration
  const tabs = [
    {
      name: "Content",
      label: "Content",
      content: renderContent(),
    },
    {
      name: "Chat",
      label: "Chat",
      content: renderChat(),
    },
    {
      name: "AI Actions",
      label: "AI Actions",
      content: renderAIActions(),
    },
    {
      name: "Flashcards",
      label: "Flashcards",
      content: renderFlashcardsTab(),
    },
    {
      name: "Quizzes",
      label: "Quizzes",
      content: renderQuizzesTab(),
    },
  ];

  // Initial Loading
  if (loading || (document?.data?._id && String(document.data._id) !== id)) {
    return <Spinner />;
  }

  // Document Not Found
  if (!document) {
    return (
      <div className="p-6 text-center text-slate-500">
        Document not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>

      {/* Page Header */}
      <PageHeader title={document.data.title} />

      {document.data.status === "processing" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This PDF is still being processed. Study tools will appear when it is ready.
        </div>
      )}
      {document.data.status === "failed" && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Text could not be extracted from this PDF, so its study tools are unavailable.
        </div>
      )}

      {/* Document Tabs */}
      <Tabs
        tabs={document.data.status === "ready" ? tabs : tabs.filter((tab) => tab.name === "Content")}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default DocumentDetailPage;
