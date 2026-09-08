import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Globe2, Compass, Layers } from 'lucide-react';
import { InteractiveEarth } from './InteractiveEarth';
import { GlobeHUD } from './GlobeHUD';
import { RegionMarkerData } from '../../lib/data/globeData';

export const GlobalGlobeSection: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionMarkerData | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<RegionMarkerData | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [resetKey, setResetKey] = useState<number>(0);

  const handleSelectRegion = (region: RegionMarkerData | null) => {
    setSelectedRegion(region);
  };

  const handleHoverRegion = (region: RegionMarkerData | null) => {
    setHoveredRegion(region);
  };

  const handleToggleAutoRotate = () => {
    setIsAutoRotate((prev) => !prev);
  };

  const handleResetView = () => {
    setSelectedRegion(null);
    setResetKey((k) => k + 1);
  };

  return (
    <section 
      id="global-globe-section" 
      aria-label="Global E-Waste & Resource Flow 3D Earth Monitor"
      className="relative py-8 md:py-12 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Frame Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative w-full rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-slate-950 via-[#030d17] to-slate-950 border border-slate-800/90 shadow-2xl overflow-hidden"
        >
          {/* Subtle Ambient Radial Lighting in the Canvas */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Subtle Technical Grid Lines */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />

          {/* Interactive 3D Earth WebGL Canvas */}
          <InteractiveEarth
            key={resetKey}
            selectedRegionId={selectedRegion ? selectedRegion.id : null}
            onSelectRegion={handleSelectRegion}
            hoveredRegionId={hoveredRegion ? hoveredRegion.id : null}
            onHoverRegion={handleHoverRegion}
            isAutoRotate={isAutoRotate}
            onToggleAutoRotate={handleToggleAutoRotate}
          />

          {/* HUD Overlay Layer */}
          <GlobeHUD
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
            hoveredRegion={hoveredRegion}
            isAutoRotate={isAutoRotate}
            onToggleAutoRotate={handleToggleAutoRotate}
            onResetView={handleResetView}
          />

          {/* Bottom subtle drag helper */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500/80 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800/40">
            <span>Drag to rotate Earth</span>
            <span>•</span>
            <span>Scroll or pinch to zoom</span>
            <span>•</span>
            <span>Click markers for regional data</span>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
