import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy, Image, Check } from 'lucide-react';

export default function ShareCardModal({ isOpen, onClose, activeChallenge }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && activeChallenge && canvasRef.current) {
      renderCanvasCard();
    }
  }, [isOpen, activeChallenge]);

  const renderCanvasCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 600;
    const height = 380;
    canvas.width = width;
    canvas.height = height;

    const completedCount = activeChallenge.days.filter((d) => d.status === 'completed').length;
    const progress = Math.round((completedCount / 30) * 100);
    const streak = activeChallenge.streak || 0;

    // Background Gradient: #0B1326 to #171F33
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0b1326');
    bgGrad.addColorStop(1, '#171f33');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Ambient Circles
    const circleGrad = ctx.createRadialGradient(500, 80, 10, 500, 80, 200);
    circleGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    circleGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(500, 80, 200, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Brand Watermark
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#c0c1ff';
    ctx.fillText('⚡ DAYBYDAY — 30 DAYS SPRINT', 40, 55);

    // Category Pill
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#8B5CF6';
    ctx.fillText((activeChallenge.category || 'MOMENTUM').toUpperCase(), 40, 95);

    // Challenge Title
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    const truncatedTitle = activeChallenge.title.length > 32 
      ? activeChallenge.title.substring(0, 32) + '...' 
      : activeChallenge.title;
    ctx.fillText(truncatedTitle, 40, 135);

    // Description
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#dae2fd';
    ctx.fillText('Consistency over intensity. Building sustainable habits daily.', 40, 168);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(40, 200);
    ctx.lineTo(width - 40, 200);
    ctx.stroke();

    // Metrics Stats Row
    // Stat 1: Streak
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#c7c4d7';
    ctx.fillText('CURRENT STREAK', 40, 240);
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`🔥 ${streak} Days`, 40, 285);

    // Stat 2: Completed
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#c7c4d7';
    ctx.fillText('COMPLETED', 240, 240);
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${completedCount} / 30`, 240, 285);

    // Stat 3: Progress
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#c7c4d7';
    ctx.fillText('SUCCESS RATE', 420, 240);
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#c0c1ff';
    ctx.fillText(`${progress}%`, 420, 285);

    // Footer note
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#908fa0';
    ctx.fillText('Tracked with DayByDay • Verified Habit Transformation', 40, 345);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `DayByDay-Streak-${activeChallenge.streak || 0}d.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // Fallback download if clipboard image copy not permitted
      handleDownload();
    }
  };

  if (!isOpen || !activeChallenge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl glass-card border border-white/10 p-6 shadow-modal-rim relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary-tint" />
            <h3 className="font-display font-bold text-lg text-white">Share Your Streak Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-glass-elevated bg-surface-lowest mb-4 flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-auto object-contain"></canvas>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-brand-indigo hover:bg-brand-indigo-dark shadow-glow-primary transition-all"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-semibold text-sm text-on-surface bg-surface-container hover:bg-surface-high border border-white/10 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-brand-emerald" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Image'}
          </button>
        </div>

      </div>
    </div>
  );
}
