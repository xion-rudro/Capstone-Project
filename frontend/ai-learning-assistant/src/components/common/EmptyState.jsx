import React from 'react';
import { FileText } from 'lucide-react';

const EmptyState = ({ title, description, icon: Icon = FileText }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 py-12 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
      <Icon className="h-7 w-7 text-emerald-600" strokeWidth={1.8} />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
    <p className="max-w-md text-sm text-slate-500">{description}</p>
  </div>
);

export default EmptyState;
