import fs from 'fs';
import path from 'path';

const pdfDir = path.join(process.cwd(), 'public', 'assignments');

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Minimal valid PDF generator helper
function createSimplePdfContent(title, subject, week, author) {
  const content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kinds [3 0 R] /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 280 >>
stream
BT
/F1 20 Tf
50 720 Td
(${title}) Tj
0 -30 Td
/F1 14 Tf
(Subject: ${subject} | Week ${week}) Tj
0 -25 Td
(Author: ${author} - Roll No: 24101C0022) Tj
0 -25 Td
(Semester V - Information Technology & Environmental Management) Tj
0 -40 Td
/F1 12 Tf
(This is an official assignment document for ${subject}.) Tj
0 -20 Td
(Uploaded to the digital E-Waste Academic Portfolio.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000130 00000 n 
0000000251 00000 n 
0000000320 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
650
%%EOF
`;
  return Buffer.from(content.trim());
}

const assignmentsList = [
  { file: 'ewaste-global-generation-report.pdf', title: 'Global E-Waste Generation & Composition Analysis', subject: 'E-Waste & Environmental Management', week: 1 },
  { file: 'ewaste-heavy-metals-contamination-report.pdf', title: 'Toxicological Impact & Heavy Metal Contamination', subject: 'E-Waste & Environmental Management', week: 3 },
  { file: 'ewaste-epr-regulatory-report.pdf', title: 'E-Waste Management Rules 2022 & EPR Compliance Policy', subject: 'E-Waste & Environmental Management', week: 6 },
  
  { file: 'ewaste-precious-metal-recovery-research.pdf', title: 'Hydrometallurgical Precious Metal Extraction', subject: 'E-Waste & Environmental Management', week: 2 },
  { file: 'ewaste-circular-economy-design-research.pdf', title: 'Circular Economy Design Paradigms for Consumer Hardware', subject: 'E-Waste & Environmental Management', week: 5 },

  { file: 'ewaste-campus-drive-activity.pdf', title: 'Campus E-Waste Collection Drive & Public Awareness Campaign', subject: 'E-Waste & Environmental Management', week: 4 },
  { file: 'ewaste-it-infrastructure-audit.pdf', title: 'Lifecycle Audit of University IT Infrastructure', subject: 'E-Waste & Environmental Management', week: 7 },

  { file: 'ewaste-green-computing-presentation.pdf', title: 'Green Computing Strategies & Energy-Efficient Data Center Architecture', subject: 'E-Waste & Environmental Management', week: 3 },
  { file: 'ewaste-health-hazards-presentation.pdf', title: 'Health Hazards Facing Informal E-Waste Processing Workers', subject: 'E-Waste & Environmental Management', week: 8 },

  { file: 'ewaste-battery-recycling-practical.pdf', title: 'Lithium-Ion Battery Safety Disassembly & Material Separation', subject: 'E-Waste & Environmental Management', week: 2 },
  { file: 'ewaste-mechanical-sorting-practical.pdf', title: 'Demolition & Deconstruction Analysis of E-Waste Components', subject: 'E-Waste & Environmental Management', week: 5 },
  { file: 'ewaste-lca-simulation-practical.pdf', title: 'Carbon Footprint Calculator & E-Waste Lifecycle Assessment', subject: 'E-Waste & Environmental Management', week: 8 },
];

for (const item of assignmentsList) {
  const filePath = path.join(pdfDir, item.file);
  const pdfBuffer = createSimplePdfContent(item.title, item.subject, item.week, 'Aryan Acharya');
  fs.writeFileSync(filePath, pdfBuffer);
  console.log(`Generated sample PDF: ${item.file}`);
}

console.log('All sample E-Waste assignment PDFs generated successfully!');

