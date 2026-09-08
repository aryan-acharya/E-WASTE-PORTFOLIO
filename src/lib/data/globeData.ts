export interface RegionMarkerData {
  id: string;
  name: string;
  countryOrContinent: string;
  lat: number;
  lon: number;
  flowRole: 'origin' | 'hub' | 'destination' | 'processing';
  headline: string;
  annualGeneration: string;
  formalRecycleRate: string;
  keyInitiative: string;
  description: string;
  regulatoryFramework: string;
  statusBadge: string;
}

export interface TradeFlowArc {
  fromId: string;
  toId: string;
  label: string;
  description: string;
}

export interface GlobalEWasteMetrics {
  annualGenerationMt: number;
  annualGenerationUnit: string;
  formalCollectionRate: number;
  formalCollectionUnit: string;
  rawMaterialValueUsd: number;
  rawMaterialValueUnit: string;
  averagePerCapitaKg: number;
  averagePerCapitaUnit: string;
  sourceAttribution: string;
  yearReported: string;
}

export const GLOBAL_METRICS: GlobalEWasteMetrics = {
  annualGenerationMt: 62.0,
  annualGenerationUnit: 'Million Metric Tonnes',
  formalCollectionRate: 22.3,
  formalCollectionUnit: '% Documented Formal Recycling',
  rawMaterialValueUsd: 91.0,
  rawMaterialValueUnit: 'Billion USD Documented Value',
  averagePerCapitaKg: 7.8,
  averagePerCapitaUnit: 'kg Global Per Capita Average',
  sourceAttribution: 'UN Global E-Waste Monitor (GEM 2024 / UNITAR & ITU)',
  yearReported: '2024–2026 Edition',
};

export const REGION_MARKERS: RegionMarkerData[] = [
  {
    id: 'india',
    name: 'India',
    countryOrContinent: 'South Asia Hub',
    lat: 20.5937,
    lon: 78.9629,
    flowRole: 'processing',
    headline: 'E-Waste Rules & EPR Transition',
    annualGeneration: '1.71 Mt / Year',
    formalRecycleRate: '15.4% (Expanding)',
    keyInitiative: 'Extended Producer Responsibility (EPR) & Circular Economy Portal',
    description: 'Rapid expansion of authorized formal dismantling capacity and integration of informal collection networks into high-tech material recovery units.',
    regulatoryFramework: 'E-Waste (Management) Rules, CPCB Guidelines',
    statusBadge: 'Active Focus Region',
  },
  {
    id: 'europe',
    name: 'European Union',
    countryOrContinent: 'Western & Central Europe',
    lat: 48.8566,
    lon: 12.3522,
    flowRole: 'hub',
    headline: 'WEEE Directive & Closed-Loop Recovery',
    annualGeneration: '13.0 Mt / Year',
    formalRecycleRate: '42.8% Formal Benchmark',
    keyInitiative: 'Right-to-Repair Directive & Critical Raw Materials Act (CRMA)',
    description: 'Global benchmark for documented collection standards, eco-design mandates, and closed-loop hydrometallurgical extraction of critical minerals.',
    regulatoryFramework: 'EU WEEE Directive (2012/19/EU) & Ecodesign',
    statusBadge: 'High Recovery Standard',
  },
  {
    id: 'east-asia',
    name: 'East Asia',
    countryOrContinent: 'Manufacturing & Refining Corridor',
    lat: 35.8617,
    lon: 104.1954,
    flowRole: 'origin',
    headline: 'High-Tech Urban Mining & Smelting',
    annualGeneration: '24.1 Mt / Year',
    formalRecycleRate: '28.5% Formal Capture',
    keyInitiative: 'Automated Printed Circuit Board (PCB) Desoldering & Precious Metal Extraction',
    description: 'World-leading capacity in high-temperature copper smelting and hydrometallurgical reclamation of gold, silver, palladium, and lithium-ion batteries.',
    regulatoryFramework: 'Circular Economy Promotion Laws & National Standards',
    statusBadge: 'Industrial Refining Hub',
  },
  {
    id: 'north-america',
    name: 'North America',
    countryOrContinent: 'US & Canada',
    lat: 39.8283,
    lon: -98.5795,
    flowRole: 'origin',
    headline: 'ITAD & Certified E-Stewards Facilities',
    annualGeneration: '14.2 Mt / Year',
    formalRecycleRate: '30.2% Formal Stream',
    keyInitiative: 'Enterprise IT Asset Disposition (ITAD) & State Take-Back Laws',
    description: 'Extensive certified refurbishment programs (R2v3 / e-Stewards) and high-density semiconductor scrap processing for corporate fleets.',
    regulatoryFramework: 'State-Level Electronics Take-Back & Federal Stewardship',
    statusBadge: 'IT Asset Stream',
  },
  {
    id: 'africa',
    name: 'Pan-Africa',
    countryOrContinent: 'West & Sub-Saharan Africa',
    lat: 5.6037,
    lon: -0.1870,
    flowRole: 'destination',
    headline: 'Transboundary Enforcement & Grassroots Hubs',
    annualGeneration: '2.9 Mt / Year',
    formalRecycleRate: '1.2% Formalized Stream',
    keyInitiative: 'Basel Convention Enforcement & Decentralized Green Micro-Refineries',
    description: 'International monitoring of second-hand electrical imports, prevention of illegal hazardous dumping, and community worker safety retrofits.',
    regulatoryFramework: 'Basel & Bamako Conventions on Hazardous Wastes',
    statusBadge: 'Monitoring Corridor',
  },
];

export const TRADE_FLOW_ARCS: TradeFlowArc[] = [
  {
    fromId: 'north-america',
    toId: 'india',
    label: 'Global Refining Trade',
    description: 'Shipment of sorted non-ferrous circuit fractions to high-capacity certified hydrometallurgy facilities.',
  },
  {
    fromId: 'europe',
    toId: 'east-asia',
    label: 'Component Circular Loop',
    description: 'Specialized silicon and rare-earth component streams for remanufacturing.',
  },
  {
    fromId: 'europe',
    toId: 'africa',
    label: 'Basel Monitored Corridor',
    description: 'Strictly monitored test-functioning second-hand equipment flow under PIC agreements.',
  },
  {
    fromId: 'east-asia',
    toId: 'india',
    label: 'Regional Supply Loop',
    description: 'Precious metal recovery and lithium-ion black mass processing corridor.',
  },
];
