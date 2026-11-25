import React from 'react';
import {
  CheckCircle2,
  Info,
  ShieldCheck,
  FileText,
  Download,
  Bookmark,
  X,
  Sparkles
} from 'lucide-react';

export default function InfoModal({
  isOpen,
  title,
  message,
  type = 'info', // 'success' | 'info' | 'terms' | 'download' | 'bookmark'
  actionText = 'Understood',
  onClose
}) {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#00885d]/25 border border-[#4edea3]/40 text-[#4edea3] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
      case 'terms':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#8083ff]/20 border border-[#8083ff]/30 text-[#8083ff] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        );
      case 'download':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#00885d]/25 border border-[#4edea3]/40 text-[#4edea3] flex items-center justify-center shrink-0">
            <Download className="w-6 h-6" />
          </div>
        );
      case 'bookmark':
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#8083ff]/20 border border-[#8083ff]/30 text-[#8083ff] flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-[#8083ff]/20 border border-[#8083ff]/30 text-[#8083ff] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#131b2e] border border-white/10 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-center gap-3.5">
          {renderIcon()}
          <div>
            <h3 className="text-lg font-display font-bold text-white tracking-tight">
              {title}
            </h3>
            <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-[#908fa0]">
              DayByDay System Notice
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="text-xs text-[#c7c4d7] leading-relaxed bg-[#0b1326] p-4 rounded-xl border border-white/5 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {typeof message === 'string' ? (
            <p className="whitespace-pre-line">{message}</p>
          ) : (
            message
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#8083ff] hover:bg-[#6c70ff] text-[#0b1326] font-display font-bold text-xs shadow-[0_0_16px_rgba(128,131,255,0.3)] transition-all cursor-pointer"
          >
            {actionText}
          </button>
        </div>

      </div>
    </div>
  );
}
