export const updates = [
  {
    id: 'cbic-2026-06-01-gst-circular',
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
    tallyImpact: 'Go to Tally → Gateway → Statutory Reports → GSTR-3B. Check your ITC ledger for mixed-use purchases and post a reversal journal entry (Dr. ITC Reversal / Cr. Input IGST/CGST/SGST) before the filing deadline.',
    url: 'https://cbic-gst.gov.in/gst-goods-services-rates.html',
    relatedSlug: 'gst-reconciliation-tallyprime-2026-guide',
  },
  {
    id: 'incometax-2026-05-15-form-26as',
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
    id: 'cbic-india-twitter-Sat, 04 Ju-gst-officials-recognized-for',
    type: 'govt',
    title: 'GST Officials Recognized for Taxpayer Help',
    source: 'CBIC India (Twitter)',
    date: 'Sat, 04 Ju',
    summary: 'On GST Day 2026, top GST officials were honored for their work in making things easier for taxpayers. This highlights the government\'s focus on improving taxpayer services. While no direct action is required from you, this shows a commitment to a smoother GST process.',
    keyPoints: [
      { label: 'Who is affected', text: 'All GST taxpayers in India.' },
      { label: 'What changed', text: 'Key GST officials received awards for their significant contributions to taxpayer facilitation.' },
      { label: 'What to do now', text: 'Continue to utilize the improved taxpayer facilitation services being developed.' },
    ],
    tallyImpact: 'No direct impact on TallyPrime 6.0 functionality based on this update.',
    url: 'https://nitter.net/DgtsKzu/status/2073320605089423607#m',
    relatedSlug: '',
  },
  {
    id: 'income-tax-india-t-Sat, 11 Ju-itr-filing-momentum-1-7-cror',
    type: 'govt',
    title: 'ITR Filing Momentum: 1.7 Crore Filed, Deadline July 31st',
    source: 'Income Tax India (Twitter)',
    date: 'Sat, 11 Ju',
    summary: 'Over 1.7 crore taxpayers have already filed their Income Tax Returns (ITRs) for Assessment Year 2026-27. With a significant number filed yesterday, the pace is picking up. If you haven\'t filed your ITR 1 or ITR 2 yet, it\'s important to do so before the July 31, 2026 deadline to avoid last-minute issues.',
    keyPoints: [
      { label: 'Who is affected', text: 'All individual taxpayers who need to file Income Tax Returns for Assessment Year 2026-27, especially those filing ITR 1 and ITR 2.' },
      { label: 'What changed', text: 'The Income Tax Department is urging taxpayers to file their returns promptly as the deadline approaches.' },
      { label: 'What to do now', text: 'File your ITR 1 and ITR 2 returns before the deadline of July 31, 2026.' },
    ],
    tallyImpact: 'No specific TallyPrime 6.0 menu path is directly impacted by this update. Taxpayers should use the official Income Tax India portal for filing.',
    url: 'https://nitter.net/IncomeTaxIndia/status/2075832548945518601#m',
    relatedSlug: '',
  },
  {
    id: 'income-tax-india-t-Wed, 08 Ju-new-income-tax-act-rules-drd',
    type: 'govt',
    title: 'New Income Tax Act & Rules: DRDO Outreach for Tax Compliance',
    source: 'Income Tax India (Twitter)',
    date: 'Wed, 08 Ju',
    summary: 'The Income Tax Department held an outreach program today focusing on the new Income Tax Act, 2025, and Income Tax Rules, 2026. This event aimed to boost awareness and compliance with the latest tax laws, especially concerning TDS (Tax Deducted at Source). Accountants and businesses should pay close attention to these updated provisions to ensure they are meeting their tax obligations correctly.',
    keyPoints: [
      { label: 'Who is affected', text: 'All taxpayers, especially those involved with TDS payments and compliance, including DDOs and PAOs within DRDO.' },
      { label: 'What changed', text: 'New Income Tax Act, 2025, and Income Tax Rules, 2026 are now in effect, along with updated TDS regulations.' },
      { label: 'What to do now', text: 'Review and understand the Income Tax Act, 2025, Income Tax Rules, 2026, and updated TDS requirements to ensure accurate tax filings.' },
    ],
    tallyImpact: 'No specific TallyPrime 6.0 menu path is mentioned in the provided update. Accountants should stay informed about updates from the Income Tax Department for any TallyPrime configuration changes.',
    url: 'https://nitter.net/DRDO_India/status/2074901718907908493#m',
    relatedSlug: '',
  },
  {
    id: 'mca-india-twitter-Wed, 08 Ju-mca-extends-ccfs-2026-deadli',
    type: 'govt',
    title: 'MCA Extends CCFS-2026 Deadline to August 31st',
    source: 'MCA India (Twitter)',
    date: 'Wed, 08 Ju',
    summary: 'The Ministry of Corporate Affairs (MCA) has extended the Companies Compliance Facilitation Scheme, 2026 (CCFS-2026) until August 31st, 2026. This means companies have more time to file certain documents without facing penalties. Check the MCA website for full details.',
    keyPoints: [
      { label: 'Who is affected', text: 'All companies registered in India.' },
      { label: 'What changed', text: 'The deadline for the Companies Compliance Facilitation Scheme, 2026 has been extended.' },
      { label: 'What to do now', text: 'File your pending company documents under CCFS-2026 by August 31st, 2026.' },
    ],
    tallyImpact: 'No direct impact on TallyPrime 6.0 functionality. This is a compliance deadline extension from the Ministry of Corporate Affairs.',
    url: 'https://nitter.net/MCA21India/status/2074873105277935697#m',
    relatedSlug: '',
  },
  {
    id: 'mca-india-twitter-Wed, 08 Ju-mca-open-house-foreign-compa',
    type: 'govt',
    title: 'MCA Open House: Foreign Company Registration & Compliance Issues',
    source: 'MCA India (Twitter)',
    date: 'Wed, 08 Ju',
    summary: 'The Ministry of Corporate Affairs (MCA) held an open house on July 10, 2026, to discuss challenges foreign companies face when registering and complying with Indian rules. This session aimed to gather feedback on common problems with Form FC-1, Digital Signature Certificates (DSCs), business structures, and director requirements. Your input can help improve these processes.',
    keyPoints: [
      { label: 'Who is affected', text: 'Companies looking to register or operate in India as foreign entities, and their authorised representatives.' },
      { label: 'What changed', text: 'The MCA is actively seeking stakeholder feedback to address and potentially streamline the registration and compliance processes for foreign companies in India.' },
      { label: 'What to do now', text: 'While the open house has passed, you can still submit your queries and suggestions regarding foreign company registration and compliance to the MCA via the provided link.' },
    ],
    tallyImpact: 'No direct impact on TallyPrime 6.0 functionalities is mentioned in this update. This update concerns MCA\'s policy and procedural discussions.',
    url: 'https://nitter.net/MCA21India/status/2074782707863753165#m',
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
