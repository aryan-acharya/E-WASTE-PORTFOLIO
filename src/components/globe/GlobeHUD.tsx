import React from 'react';
import { 
  Globe2, 
  RotateCw, 
  Pause, 
  Play, 
  Layers, 
  Sparkles, 
  Compass, 
  X, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Activity,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { 
  REGION_MARKERS, 
  GLOBAL_METRICS, 
  RegionMarkerData 
} from '../../lib/data/globeData';

interface GlobeHUDProps {
  selectedRegion: RegionMarkerData | null;
  onSelectRegion: (region: RegionMarkerData | null) => void;
  hoveredRegion: RegionMarkerData | null;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  onResetView: () => void;
}

export const GlobeHUD: React.FC<GlobeHUDProps> = ({
  selectedRegion,
  onSelectRegion,
  hoveredRegion,
  isAutoRotate,
  onToggleAutoRotate,
  onResetView,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-8">
      
      {/* TOP BAR: Telemetry Badge & Live Stream Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Left Header Tag */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl glass-card bg-slate-950/80 border border-slate-800/80 dark:border-slate-800 shadow-lg backdrop-blur-md">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-black tracking-wider uppercase text-white font-mono flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Global E-Waste Monitor</span>
          </span>
          <span className="hidden md:inline-block text-[10px] text-slate-500 border-l border-slate-800 pl-2 font-mono">
            {GLOBAL_METRICS.yearReported}
          </span>
        </div>

        {/* Right Header Status / Active Region Readout */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 px-3 py-1 rounded-2xl glass-card bg-slate-950/70 border border-slate-800/80 backdrop-blur-md text-[11px] font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Stream:</span>
          <span className="text-emerald-400 font-bold">
            {selectedRegion ? selectedRegion.name : hoveredRegion ? hoveredRegion.name : '3D Orbit Active'}
          </span>
          {selectedRegion && (
            <span className="text-[10px] text-slate-500">
              ({selectedRegion.lat.toFixed(1)}°N, {selectedRegion.lon.toFixed(1)}°E)
            </span>
          )}
        </div>

      </div>

      {/* CENTER / MIDDLE LAYER: Floating Regional Detail Card & Metrics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center my-auto pointer-events-none">
        
        {/* Left Telemetry Box (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 pointer-events-auto space-y-3">
          <div className="p-4 rounded-2xl glass-card bg-slate-950/80 border border-slate-800/80 shadow-2xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                OBSERVATION TELEMETRY
              </span>
              <span className="text-emerald-400">LIVE</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Monitoring Standard</span>
                <span className="font-mono text-emerald-400 font-bold">UN GEM v2024</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Tracked Nodes</span>
                <span className="font-mono text-white font-bold">{REGION_MARKERS.length} Global Corridors</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Navigation</span>
                <span className="text-[11px] text-slate-400 font-mono">Drag & Zoom WebGL</span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Projection: Equirectangular 3D</span>
              <span className="text-emerald-400">60 FPS</span>
            </div>
          </div>
        </div>

        {/* Center: When a region is selected, show rich inspection card */}
        <div className="lg:col-span-6 flex justify-center pointer-events-none">
          {selectedRegion && (
            <div className="pointer-events-auto w-full max-w-md p-5 sm:p-6 rounded-3xl glass-card bg-slate-950/95 border border-emerald-500/40 shadow-2xl backdrop-blur-xl space-y-4 animate-fade-in relative">
              {/* Close Button */}
              <button
                onClick={() => onSelectRegion(null)}
                aria-label="Close region inspection"
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase font-mono tracking-wider">
                    {selectedRegion.statusBadge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedRegion.countryOrContinent}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {selectedRegion.name}
                </h3>
                <p className="text-xs font-bold text-emerald-400">
                  {selectedRegion.headline}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 py-1">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Annual E-Waste</span>
                  <span className="text-sm font-black text-white font-mono mt-0.5 block">
                    {selectedRegion.annualGeneration}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Recycle Capture</span>
                  <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">
                    {selectedRegion.formalRecycleRate}
                  </span>
                </div>
              </div>

              {/* Details & Circular Economy Mandates */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedRegion.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedRegion.regulatoryFramework}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Global Stats HUD (Inspired by Canopy reference metrics) */}
        <div className="lg:col-span-3 pointer-events-auto flex flex-col items-end space-y-3">
          <div className="w-full max-w-xs p-4 rounded-2xl glass-card bg-slate-950/80 border border-slate-800/80 shadow-2xl backdrop-blur-md space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Planetary Impact Metrics
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold border border-emerald-500/20">
                Verified UN GEM
              </span>
            </div>

            {/* Metric 1: Annual E-Waste */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono text-slate-400">
                Global E-Waste Generated
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  62,000,000
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  Tonnes
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                62 Mt generated annually across consumer & industrial streams.
              </span>
            </div>

            {/* Sub-metrics row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Formal Recycling</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {GLOBAL_METRICS.formalCollectionRate}%
                </span>
                <span className="text-[9px] text-slate-500 block">Documented capture</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Resource Value</span>
                <span className="text-base font-black text-white font-mono">
                  ${GLOBAL_METRICS.rawMaterialValueUsd}B
                </span>
                <span className="text-[9px] text-slate-500 block">Recoverable minerals</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[9px] text-slate-500 font-mono flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span>{GLOBAL_METRICS.sourceAttribution}</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR: Region Filter Pills & Interactive Orbit Controls */}
      <div className="pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        
        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => onSelectRegion(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedRegion === null
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500'
                : 'glass-card bg-slate-950/70 hover:bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Global Overview</span>
          </button>

          {REGION_MARKERS.map((region) => {
            const isSelected = selectedRegion?.id === region.id;
            return (
              <button
                key={region.id}
                onClick={() => onSelectRegion(region)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500'
                    : 'glass-card bg-slate-950/70 hover:bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{region.name}</span>
              </button>
            );
          })}
        </div>

        {/* Orbit & Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoRotate}
            aria-label={isAutoRotate ? 'Pause Earth orbit' : 'Resume Earth orbit'}
            className="px-3 py-1.5 rounded-xl glass-card bg-slate-950/80 hover:bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            {isAutoRotate ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pause Orbit</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume Orbit</span>
              </>
            )}
          </button>

          <button
            onClick={onResetView}
            aria-label="Reset camera orientation"
            className="p-1.5 rounded-xl glass-card bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800 transition-colors"
            title="Reset View"
          >
            <RotateCw className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

      </div>

    </div>
  );
};
