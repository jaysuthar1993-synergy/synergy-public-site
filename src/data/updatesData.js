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
