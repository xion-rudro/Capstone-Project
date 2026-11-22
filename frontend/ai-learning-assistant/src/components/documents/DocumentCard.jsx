
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Trash2,
  BookOpen,
  BrainCircuit,
  Clock,
} from "lucide-react";
import moment from "moment";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      className="group relative bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all duration-300 overflow-hidden"
      onClick={handleNavigate}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 rounded-xl">
          <FileText
            className="w-6 h-6 text-emerald-600"
            strokeWidth={2}
          />
        </div>

        <button
          onClick={handleDelete}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete document"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Title */}
      <h3
        className="text-lg font-semibold text-slate-800 truncate mb-2"
        title={document.title}
      >
        {document.title}
      </h3>

      {/* Document Info */}
      <div className="flex items-center gap-3 text-sm text-slate-500 mb-5">
        {document.fileSize !== undefined && (
          <span>{formatFileSize(document.fileSize)}</span>
        )}
      </div>

      {/* Stats Section */}
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
        {document.flashcardCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen className="w-4 h-4 text-blue-500" strokeWidth={2} />
            <span>{document.flashcardCount} Flashcards</span>
          </div>
        )}

        {document.quizCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BrainCircuit
              className="w-4 h-4 text-purple-500"
              strokeWidth={2}
            />
            <span>{document.quizCount} Quizzes</span>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mt-5">
        <Clock className="w-4 h-4" strokeWidth={2} />
        <span>
          Uploaded{" "}
          {document.createdAt
            ? moment(document.createdAt).fromNow()
            : "Unknown"}
        </span>
      </div>

      {/* Hover Indicator */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-emerald-500 group-hover:w-full transition-all duration-300" />
    </div>
  );
};

export default DocumentCard;