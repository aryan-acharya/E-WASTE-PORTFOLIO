import { Assignment } from '../../types';

export const SAMPLE_ASSIGNMENTS_DATA: Assignment[] = [
  {
    id: 'ew-report-01',
    title: 'Global E-Waste Generation & Composition Analysis Report',
    subject: 'E-Waste & Environmental Management',
    weekNumber: 1,
    submissionDate: '2026-07-10',
    description: 'Comprehensive quantitative investigation into global electronic waste generation rates, categorizing e-waste streams into large household appliances, IT hardware, telecommunication devices, and consumer electronics.',
    pdfUrl: '/assignments/ewaste-global-generation-report.pdf',
    fileSize: '2.4 MB',
    type: 'Report',
    category: 'Reports',
    status: 'Evaluated',
    marksObtained: '20/20',
    topics: ['Global E-Waste Data', 'Waste Characterization', 'Consumer Electronics', 'E-Waste Streams']
  },
  {
    id: 'ew-report-02',
    title: 'Toxicological Impact & Heavy Metal Soil Contamination Report',
    subject: 'E-Waste & Environmental Management',
    weekNumber: 3,
    submissionDate: '2026-07-24',
    description: 'Analytical assessment of lead, cadmium, mercury, brominated flame retardants (BFRs), and beryllium leaching into soil and groundwater surrounding informal e-waste dumpsites.',
    pdfUrl: '/assignments/ewaste-heavy-metals-contamination-report.pdf',
    fileSize: '3.1 MB',
    type: 'Report',
    category: 'Reports',
    status: 'Evaluated',
    marksObtained: '19/20',
    topics: ['Heavy Metals', 'Soil Contamination', 'Leachate Analysis', 'Toxicological Impact']
  }
];

// Cleared assignments list as requested by user
export const ASSIGNMENTS_DATA: Assignment[] = [];
