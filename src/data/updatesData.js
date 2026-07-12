export const updates = [
  {
    id: 'cbic-gst-portal-2026-06-01-itc-reversal-rule-42',
    type: 'govt',
    title: 'CBIC Clarifies ITC Reversal Rules Under Rule 42 for Mixed Supply Dealers',
    source: 'CBIC GST Portal',
    date: '2026-06-01',
    summary: 'If your business sells both taxable and exempt goods or services — like a hospital that also runs a pharmacy — you cannot claim 100% of your GST input tax credit. CBIC has now issued a circular with a clear formula to calculate exactly how much ITC you must reverse at the end of each financial year. This removes the earlier confusion about different methods used by different CAs.',
    keyPoints: [
      { label: 'Who is affected', text: 'Businesses with both taxable and exempt supplies (hospitals, educational institutions, mixed traders)' },
      { label: 'What changed', text: 'CBIC issued Circular 224/18/2026-GST with a mandatory formula for ITC reversal — no more guesswork' },
      { label: 'What to do now', text: 'Calculate ITC reversal using the new formula and post adjustment entries before filing GSTR-3B for June 2026' },
    ],
    tallyImpact: 'Go to TallyPrime → Gateway → Statutory Reports → GSTR-3B. Check your ITC ledger for mixed-use purchases and post a reversal journal entry (Dr. ITC Reversal / Cr. Input IGST/CGST/SGST) before the filing deadline.',
    url: 'https://cbic-gst.gov.in/gst-goods-services-rates.html',
    relatedSlug: 'gst-reconciliation-tallyprime-2026-guide',
  },
  {
    id: 'incometax-dept-2026-05-15-ais-bank-transactions',
    type: 'govt',
    title: 'Income Tax AIS Now Shows Your Bank Transactions — Cross-Check Before Filing ITR',
    source: 'Income Tax Department',
    date: '2026-05-15',
    summary: 'The Annual Information Statement (AIS) on the income tax portal now shows transaction data pulled directly from banks — including cash deposits above ₹10 lakh, credit card payments above ₹1 lakh, and FD openings. If your books and the AIS data don\'t match, the IT department can automatically flag your return for scrutiny. Check before filing.',
    keyPoints: [
      { label: 'What AIS now shows', text: 'Cash deposits >₹10L, credit card spends >₹1L, fixed deposit openings — pulled from banks automatically' },
      { label: 'The risk', text: 'Mismatch between AIS and your ITR = automatic scrutiny notice, no manual review needed' },
      { label: 'Check this in Tally', text: 'Match your bank ledger cash entries and FD vouchers against the AIS data at incometax.gov.in' },
    ],
    tallyImpact: 'In TallyPrime: run the Bank Book report (Gateway → Account Books → Cash/Bank Books) for each bank account. Compare totals for cash deposits and FD entries against the AIS on the income tax portal. Any difference must be explained or corrected before filing.',
    url: 'https://www.incometax.gov.in/iec/foportal/',
    relatedSlug: '',
  },
  {
    id: 'incometax-twitter-2026-07-11-itr-deadline-july31',
    type: 'govt',
    title: 'ITR Filing: 1.7 Crore Already Filed — Deadline is July 31st',
    source: 'Income Tax Department',
    date: '2026-07-11',
    summary: 'Over 1.7 crore taxpayers have already filed their ITR for Assessment Year 2026-27. If you have not filed yet, July 31st is the deadline for ITR-1 and ITR-2. Filing late means a penalty of ₹5,000 (₹1,000 if income below ₹5 lakh), plus interest on any tax due. File now to avoid last-minute server rush.',
    keyPoints: [
      { label: 'Who must file by July 31st', text: 'Salaried individuals, small business owners filing ITR-1 or ITR-2 for AY 2026-27' },
      { label: 'Penalty for missing deadline', text: '₹5,000 late fee (₹1,000 if income below ₹5 lakh) + interest under Section 234A' },
      { label: 'What to check in Tally first', text: 'Match your salary, bank interest, and TDS entries against Form 26AS and AIS before filing' },
    ],
    tallyImpact: 'In TallyPrime: Gateway → Account Books → Cash/Bank Books — verify FD interest, salary credits, and TDS deducted. Cross-check with Form 26AS (incometax.gov.in) to ensure no mismatch before filing ITR.',
    url: 'https://www.incometax.gov.in/iec/foportal/',
    relatedSlug: '',
  },
  {
    id: 'mca-india-2026-07-08-ccfs-2026-deadline-august31',
    type: 'govt',
    title: 'MCA Extends CCFS-2026 Deadline to August 31st — File Pending Documents Now',
    source: 'Ministry of Corporate Affairs',
    date: '2026-07-08',
    summary: 'The Ministry of Corporate Affairs has extended the Companies Compliance Facilitation Scheme 2026 (CCFS-2026) deadline to August 31st, 2026. Under this scheme, companies can file overdue documents with reduced or waived additional fees. If your company has pending annual filings, board resolutions, or charge documents, this is the window to clear them without heavy penalties.',
    keyPoints: [
      { label: 'Who benefits', text: 'Companies with overdue filings — annual returns, financial statements, charge documents, board resolutions' },
      { label: 'What the scheme offers', text: 'Reduced or waived additional fees for filing overdue documents — normal fees still apply' },
      { label: 'Deadline', text: 'August 31st, 2026 — after this, standard penalty rates resume' },
    ],
    tallyImpact: 'In TallyPrime: Gateway → Statutory Reports — check if your company\'s financial statements (Balance Sheet, P&L) are finalized and ready for MCA filing. Ensure all audit entries are posted before generating MCA-ready reports.',
    url: 'https://www.mca.gov.in/',
    relatedSlug: '',
  },
];

export function getRecentUpdates(limit = 20) {
  return updates
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function getUpdatesByType(type) {
  return updates.filter(u => u.type === type).sort((a, b) => new Date(b.date) - new Date(a.date));
}
