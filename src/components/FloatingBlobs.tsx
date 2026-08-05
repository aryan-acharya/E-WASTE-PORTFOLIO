import React from 'react';

export const FloatingBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Top Right Blob */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-100/60 dark:bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none animate-blob-slow" />
      
      {/* Bottom Left Blob */}
      <div className="absolute bottom-[-100px] left-[-100px] w-[450px] h-[450px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-[100px] pointer-events-none animate-blob-reverse" />
      
      {/* Center Subtle Emerald Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50/40 dark:bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] dark:opacity-[0.05]" />
    </div>
  );
};

