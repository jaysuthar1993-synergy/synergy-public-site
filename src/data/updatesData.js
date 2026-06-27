export const updates = [
  {
    id: 'cbic-2026-06-01-gst-circular',
    type: 'govt',
    title: 'CBIC Clarifies ITC Reversal Rules Under Rule 42 for Mixed Supply Dealers',
    source: 'CBIC GST Portal',
    date: '2026-06-01',
    summary: 'CBIC issued Circular No. 224/18/2026-GST clarifying how input tax credit reversal should be calculated for taxpayers dealing in both taxable and exempt supplies. The circular provides a formula-based approach to determine the reversal amount at the end of each financial year.',
    url: 'https://cbic-gst.gov.in/gst-goods-services-rates.html',
    tallyImpact: 'Businesses with mixed supply need to review ITC ledger entries and may need to post reversal entries in Tally before filing GSTR-3B for June 2026.',
  },
  {
    id: 'incometax-2026-05-15-form-26as',
    type: 'govt',
    title: 'Income Tax Department Updates AIS to Include High-Value Transaction Data from Banks',
    source: 'Income Tax Department',
    date: '2026-05-15',
    summary: 'The Annual Information Statement (AIS) now includes detailed transaction data from banks for cash deposits above ₹10 lakh, credit card payments above ₹1 lakh, and fixed deposit openings. Taxpayers should cross-verify AIS with their books before filing ITR.',
    url: 'https://www.incometax.gov.in/iec/foportal/',
    tallyImpact: 'Cross-verify cash deposit and FD entries in your Tally bank ledgers against AIS data to avoid discrepancies that may trigger notices.',
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
