import { Assignment } from '../../types';

// Signed commitment pledge poster for Activity 01
export const COMMITMENT_POSTER_SVG = '/assignments/activity-01/commitment-pledge.png';

export const ASSIGNMENTS: Assignment[] = [
  {
    id: 'activity-01',
    activityNumber: 1,
    activityCode: 'ACTIVITY 01',
    slug: 'activity-01',
    tagPill: 'ACTIVITY',
    title: 'E-Waste Awareness & Responsible Technology',
    subject: 'E-Waste & Environmental Management',
    weekNumber: 1,
    submissionDate: '2026-07-29',
    shortDescription: 'Formal student commitment and institutional engineering pledge to mitigate electronic waste trajectories and foster circular hardware lifecycles.',
    description: 'To establish a personal and technical commitment toward mitigating electronic waste, promoting circular electronics lifecycles, and documenting responsible hardware disposition across IT systems.',
    objective: 'To establish a personal and technical commitment toward mitigating electronic waste, promoting circular electronics lifecycles, and documenting responsible hardware disposition across IT systems.',
    
    // Evidence
    evidenceDescription: 'Official signed sustainability pledge poster and submission documentation certifying compliance with institutional green computing ethics.',
    evidenceItems: [
      {
        id: 'ev-1',
        url: '/assignments/activity-01/commitment-pledge.png',
        name: 'My Commitment to a Sustainable Future (Signed Pledge Poster)',
        type: 'image',
        caption: 'Student Commitment Pledge: Aryan Acharya (Roll No. 24101C0022)',
        fileSize: '645 KB'
      },
      {
        id: 'ev-1-pdf',
        url: '/assignments/activity-01/assignment.pdf',
        name: 'Official E-Waste Awareness Document',
        type: 'pdf',
        caption: 'Signed Academic Coursework PDF for Activity 01',
        fileSize: '1.4 MB'
      }
    ],
    coverImageUrl: '/assignments/activity-01/commitment-pledge.png',

    // What I Learned (~150 words)
    whatILearned: 'Through analyzing global e-waste trajectories, I learned that improper hardware disposal releases toxic heavy metals such as lead, mercury, and cadmium into ground soil while exhausting non-renewable rare earth minerals. Understanding the end-to-end lifecycle of consumer electronics reveals that hardware longevity is heavily dictated by software optimization, repairability, and modular system design. As an IT engineering student, I realized that writing efficient code and advocating for open technical documentation directly extends component lifespans, reducing premature device obsolescence across modern digital infrastructures.',

    // Sustainability Connection
    sustainabilityConnection: 'This activity helps reduce e-waste by establishing strict guidelines for modular system design, hardware component recycling, and software optimization that prevents functional devices from being rendered obsolete by heavy software bloat.',

    // Reflection
    reflection: {
      whatSurprisedMe: 'The sheer volume of perfectly functional electronic hardware discarded globally every year simply due to unoptimized software updates and lack of documentation.',
      whatChallengedMe: 'Balancing peak computational performance requirements with low-energy, sustainable hardware utilization across modern development environments.',
      whatWillIDoDifferently: 'Prioritize lightweight software architectures, advocate for repairable hardware standards, and champion technical documentation for long-term device maintenance.'
    },

    // References
    references: [
      {
        id: 'ref-1',
        text: 'UNEP Global E-Waste Monitor Report',
        url: 'https://www.itu.int/en/ITU-D/Environment/Pages/Spotlight/Global-Ewaste-Monitor.aspx'
      },
      {
        id: 'ref-2',
        text: 'Basel Action Network (BAN) E-Waste Standards',
        url: 'https://www.ban.org/'
      },
      {
        id: 'ref-3',
        text: 'IEEE Sustainable Systems & Hardware Engineering',
        url: 'https://ieeexplore.ieee.org/'
      }
    ],

    pdfUrl: '/assignments/activity-01/assignment.pdf',
    fileSize: '1.4 MB',
    type: 'Activity',
    category: 'Activities',
    status: 'Evaluated',
    isPublished: true
  },
  {
    id: 'activity-02',
    activityNumber: 2,
    activityCode: 'ACTIVITY 02',
    slug: 'activity-02',
    tagPill: 'PRACTICAL',
    title: 'Hardware Teardown & Component Lifecycle Audit',
    subject: 'E-Waste & Environmental Management',
    weekNumber: 3,
    submissionDate: '2026-08-12',
    shortDescription: 'Empirical disassembly and toxicological material mapping of legacy computing motherboards, capacitors, and silicon chipsets.',
    description: 'To test and demonstrate comprehensive knowledge of e-waste metrics, regional Indian state statistics (Maharashtra, Delhi, Bihar), hazardous metal testing protocols (TCLP, Lead), and sustainable recycling channels through an interactive crossword assessment.',
    objective: 'To test and demonstrate comprehensive knowledge of e-waste metrics, regional Indian state statistics (Maharashtra, Delhi, Bihar), hazardous metal testing protocols (TCLP, Lead), and sustainable recycling channels through an interactive crossword assessment.',
    evidenceDescription: 'Official E-Waste Mastermind crossword assessment certifying knowledge of regional WEEE metrics, TCLP testing protocols, hazardous metals, and circular recycling pathways.',
    evidenceItems: [
      {
        id: 'ev-2-pdf',
        url: '/assignments/activity-02/Crossword.pdf',
        name: 'E-Waste Mastermind Crossword Assessment',
        type: 'pdf',
        caption: 'Interactive E-Waste Mastermind Crossword PDF for Activity 02',
        fileSize: '71 KB'
      }
    ],
    coverImageUrl: '',
    whatILearned: 'Solving the E-Waste Mastermind crossword reinforced key environmental statistics and regulatory standards governing e-waste in India. I learned that Maharashtra contributes the highest volume of WEEE (Waste Electrical and Electronic Equipment) in India, while Delhi records the highest per-capita e-waste generation, and Bihar records the lowest per-capita e-waste generation. Furthermore, the TCLP (Toxicity Characteristic Leaching Procedure) test determines hazardous waste levels, frequently detecting dangerous lead concentrations. Recognizing that 15–20% of e-waste is handled by the informal sector underscores the urgent necessity for standardized, formal recycling infrastructures and consumer awareness.',
    sustainabilityConnection: 'Understanding regional e-waste generation metrics and toxic material profiles (such as lead, CFL lamp mercury, and plastics) directly informs responsible engineering decisions. It encourages designing products with non-hazardous material alternatives, establishing formal recycling pathways, and minimizing electronic waste accumulation in municipal landfills.',
    reflection: {
      whatSurprisedMe: 'That 15–20% of e-waste processing is driven by the informal sector, and that Maharashtra leads the country in total WEEE volume generation.',
      whatChallengedMe: 'Distinguishing between per-capita generation rankings (Delhi vs. Bihar) and total state volume contributions (Maharashtra), alongside identifying specific regulatory testing acronyms like TCLP.',
      whatWillIDoDifferently: 'Incorporate toxic material compliance checks (such as RoHS and TCLP standards) early in hardware system specification and technical documentation.'
    },
    references: [
      {
        id: 'ref-2-1',
        text: 'Central Pollution Control Board (CPCB) India E-Waste Management Rules',
        url: 'https://cpcb.nic.in/'
      },
      {
        id: 'ref-2-2',
        text: 'Toxicity Characteristic Leaching Procedure (TCLP) EPA Method 1311',
        url: 'https://www.epa.gov/'
      },
      {
        id: 'ref-2-3',
        text: 'India Ministry of Environment, Forest and Climate Change (MoEFCC) E-Waste Reports',
        url: 'https://moef.gov.in/'
      }
    ],
    pdfUrl: '/assignments/activity-02/Crossword.pdf',
    fileSize: '71 KB',
    type: 'Practical',
    category: 'Practicals',
    status: 'Evaluated',
    isPublished: true
  },
  {
    id: 'activity-03',
    activityNumber: 3,
    activityCode: 'ACTIVITY 03',
    slug: 'activity-03',
    tagPill: 'RESEARCH',
    title: 'Hydrometallurgical Precious Metal Leaching Analysis',
    subject: 'E-Waste & Environmental Management',
    weekNumber: 5,
    submissionDate: '2026-08-26',
    shortDescription: 'Comparative study evaluating eco-friendly bio-leaching agents versus conventional cyanide-based gold and copper recovery.',
    description: 'Evaluating bio-hydrometallurgical extraction pathways using Aspergillus niger and thiourea to replace hazardous pyrometallurgical smelting.',
    objective: 'To formulate an environmentally benign chemical protocol for extracting gold and copper from pulverized mobile phone circuit boards while minimizing acid run-off.',
    evidenceDescription: 'Laboratory assay spectral graph comparing leaching efficiency across citric acid, glycine, and hydrochloric acid solutions.',
    evidenceItems: [
      {
        id: 'ev-3-1',
        url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80',
        name: 'Leaching Assay & Chemical Precipitation Chamber',
        type: 'image',
        caption: 'Spectrophotometer readings assessing copper ion extraction in glycine solutions',
        fileSize: '1.8 MB'
      },
      {
        id: 'ev-3-pdf',
        url: '/assignments/activity-03/assignment.pdf',
        name: 'Precious Metal Leaching Research PDF',
        type: 'pdf',
        caption: 'Quantitative Assay Findings & Reaction Kinetics Analysis',
        fileSize: '3.1 MB'
      }
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80',
    whatILearned: 'Bio-leaching with amino acid reagents achieves up to 84% copper dissolution at room temperature without generating sulfur dioxide fumes typical of smelting. While the kinetic rate is slower than aggressive aqua regia, the environmental footprint is diminished by over 90%, making decentralized urban mining practical for local communities.',
    sustainabilityConnection: 'Replaces carbon-intensive thermal smelting with closed-loop room-temperature chemistry, preventing hazardous emissions in developing recycling clusters.',
    reflection: {
      whatSurprisedMe: 'A single ton of discarded smartphone circuit boards contains up to 40 times more gold per ton than average mined ore from natural rock veins.',
      whatChallengedMe: 'Maintaining solution pH homeostasis without consuming excessive neutralizing alkali reagents.',
      whatWillIDoDifferently: 'Integrate automated peristaltic pH micro-pumps to maintain optimum chelation equilibria.'
    },
    references: [
      {
        id: 'ref-3-1',
        text: 'Journal of Cleaner Production — Biohydrometallurgy of E-Waste',
        url: 'https://www.sciencedirect.com/journal/journal-of-cleaner-production'
      },
      {
        id: 'ref-3-2',
        text: 'Circular Electronics Partnership (CEP) Roadmap',
        url: 'https://cep2030.org/'
      }
    ],
    pdfUrl: '/assignments/activity-03/assignment.pdf',
    fileSize: '3.1 MB',
    type: 'Research',
    category: 'Research',
    status: 'Evaluated',
    isPublished: true
  },
  {
    id: 'activity-04',
    activityNumber: 4,
    activityCode: 'ACTIVITY 04',
    slug: 'activity-04',
    tagPill: 'REPORT',
    title: 'Circular Tech & Campus E-Waste Audit Protocol',
    subject: 'E-Waste & Environmental Management',
    weekNumber: 7,
    submissionDate: '2026-09-04',
    shortDescription: 'Comprehensive campus-wide audit quantifying institutional electronic device turnover, storage accumulation, and certified recycling channels.',
    description: 'Formulate an institutional EPR (Extended Producer Responsibility) policy and establish structured e-waste collection hubs across university departments.',
    objective: 'To establish a standardized data audit workflow across 6 engineering campus laboratories to catalog retired monitors, UPS units, and compute clusters for certified refurbishing.',
    evidenceDescription: 'Institutional inventory tracking sheet and campus collection kiosk architectural schematics.',
    evidenceItems: [
      {
        id: 'ev-4-1',
        url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
        name: 'Campus E-Waste Categorization Facility',
        type: 'image',
        caption: 'Organized sorting of Li-ion power packs and peripheral cables for safe transfer',
        fileSize: '2.4 MB'
      },
      {
        id: 'ev-4-pdf',
        url: '/assignments/activity-04/assignment.pdf',
        name: 'Campus IT Infrastructure Audit Report PDF',
        type: 'pdf',
        caption: 'Inventory Registry & Refurbishment Readiness Audit',
        fileSize: '1.9 MB'
      }
    ],
    coverImageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
    whatILearned: 'Over 62% of campus obsolete hardware was sitting idle in department storage due to security fears regarding hard drive data remanence. Implementing NIST 800-88 certified cryptographic media sanitization allowed dozens of desktop PCs to be safely donated to rural primary schools rather than scrapped.',
    sustainabilityConnection: 'Demonstrates how IT engineering policies can unlock device reuse, prioritizing second-life deployment before physical materials recycling.',
    reflection: {
      whatSurprisedMe: 'How easily data destruction protocols unlock hardware reuse — fear of data breach was the single largest obstacle to responsible disposition.',
      whatChallengedMe: 'Coordinating cross-departmental inventory registries across varying legacy spreadsheet formats.',
      whatWillIDoDifferently: 'Deploy an automated open-source asset tag barcode scanner web application to streamline equipment logging.'
    },
    references: [
      {
        id: 'ref-4-1',
        text: 'NIST Special Publication 800-88 Revision 1: Guidelines for Media Sanitization',
        url: 'https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final'
      },
      {
        id: 'ref-4-2',
        text: 'E-Waste (Management) Rules, Government of India Environmental Notification',
        url: 'https://cpcb.nic.in/e-waste/'
      }
    ],
    pdfUrl: '/assignments/activity-04/assignment.pdf',
    fileSize: '1.9 MB',
    type: 'Report',
    category: 'Reports',
    status: 'Evaluated',
    isPublished: true
  }
];
