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
    tagPill: 'ACTIVITY',
    title: 'DEVICE ANATOMY',
    subject: 'E-Waste & Environmental Management',
    weekNumber: 5,
    submissionDate: '2026-09-02',
    shortDescription: 'Engineering Investigation of an Electronic Device at End-of-Life',
    description: 'To investigate the material and component anatomy of a non-functional hard disk, identify valuable and hazardous materials, evaluate their recovery and end-of-life pathways, and propose engineering modifications that improve repairability, disassembly, recycling, and overall circularity of the device.',
    objective: 'To investigate the material and component anatomy of a non-functional hard disk, identify valuable and hazardous materials, evaluate their recovery and end-of-life pathways, and propose engineering modifications that improve repairability, disassembly, recycling, and overall circularity of the device.',
    evidenceDescription: 'Official Device Anatomy 2.0 engineering worksheet and photographic evidence documenting the component teardown, material recovery, and circular lifecycle analysis of a non-functional hard disk.',
    evidenceItems: [
      {
        id: 'ev-3-pdf',
        url: '/assignments/activity-03/device-anatomy-ewem.pdf',
        name: 'device-anatomy-ewem.pdf',
        type: 'pdf',
        caption: 'Device Anatomy 2.0: Engineering Investigation of an Electronic Device at End-of-Life',
        fileSize: '1.5 MB'
      }
    ],
    coverImageUrl: '',
    whatILearned: 'This activity helped me understand that an electronic device such as a hard disk is a complex combination of materials, components, and potential environmental risks. I learned how different materials are selected for specific functions, such as aluminium for lightweight structural components, copper for electrical conductivity, and neodymium in permanent magnets because of its strong magnetic properties. I also learned that valuable materials such as copper, aluminium, and rare-earth magnets can potentially be recovered instead of being treated simply as waste. The activity highlighted the importance of controlled handling of components such as PCBs and designing products with easier disassembly, repair, refurbishment, and material recovery in mind. The hard disk therefore represents an opportunity for circular-economy practices rather than simply being discarded as e-waste.',
    sustainabilityConnection: 'Understanding the material composition and end-of-life pathways of electronic devices supports the principles of a circular economy. Designing hard disks and similar products with standardized fasteners, modular components, easier material separation, and recoverable materials can improve repair, refurbishment, and recycling. Recovering materials such as copper, aluminium, and rare-earth magnets also reduces the need for extracting new resources and helps minimize the environmental impact of e-waste.',
    reflection: {
      whatSurprisedMe: 'I was surprised by how many different materials and valuable components are present inside a small hard disk. In particular, the presence of a powerful neodymium permanent magnet and recoverable materials such as copper and aluminium showed me that an apparently unusable device still contains significant material value.',
      whatChallengedMe: 'The main challenge was identifying the different components and understanding why specific materials were used in them. It was also challenging to distinguish between materials that have high recovery value and those that require controlled handling because of their environmental risks. Understanding how the components could be separated without damaging or contaminating valuable materials was another important challenge.',
      whatWillIDoDifferently: 'In future, I will consider end-of-life management earlier when evaluating or designing electronic products. I will focus more on modular construction, standardized fasteners, easier disassembly, material identification, and the possibility of recovering valuable components and materials. I will also consider repair, reuse, refurbishment, and recycling as part of the initial engineering design rather than treating disposal as the final step.'
    },
    references: [
      {
        id: 'ref-3-1',
        text: 'Central Pollution Control Board (CPCB), E-Waste Management Rules and Guidelines, Government of India.',
        url: 'https://cpcb.nic.in/'
      },
      {
        id: 'ref-3-2',
        text: 'Ministry of Environment, Forest and Climate Change (MoEFCC), E-Waste Management Resources, Government of India.',
        url: 'https://moef.gov.in/'
      },
      {
        id: 'ref-3-3',
        text: 'United Nations Institute for Training and Research (UNITAR), Global E-waste Monitor.',
        url: 'https://ewastemonitor.info/'
      }
    ],
    pdfUrl: '/assignments/activity-03/device-anatomy-ewem.pdf',
    fileSize: '1.5 MB',
    type: 'Activity',
    category: 'Activities',
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
