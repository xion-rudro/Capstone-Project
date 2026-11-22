import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Background Overlay */}
        <div
          className="fixed inset-0 z-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className={`relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 ${className}`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Modal Header */}
          <div className="mb-6 pr-8">
            <h3 className="text-xl font-medium text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>

          {/* Modal Body */}
          <div>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
