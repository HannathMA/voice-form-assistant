import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles } from 'lucide-react';

export default function LoadingOverlay() {
  const { loading } = useApp();

  if (!loading.active) return null;

  return (
    <div className="loading-backdrop" role="dialog" aria-modal="true" aria-live="assertive">
      <div className="loading-modal">
        <div className="loading-animation-wrapper">
          <div className="loading-pulse-ring"></div>
          <div className="loading-pulse-core">
            <Sparkles className="loading-sparkle" size={28} />
          </div>
        </div>
        <p className="loading-text">{loading.message || 'Processing with AI…'}</p>
        <div className="loading-wave-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
