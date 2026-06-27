export const banks = [
  {
    slug: 'hdfc',
    name: 'HDFC Bank',
    fullName: 'HDFC Bank Limited',
    keyword: 'HDFC bank statement to Tally',
    description: 'How to import HDFC Bank Excel statement directly to Tally Prime or ERP 9 using Synergy Automation. No XML needed.',
    excelFormat: 'HDFC Bank net banking exports statements as .xlsx files. Columns: Date, Narration, Value Dat, Debit Amount, Credit Amount, Chq/Ref Number, Closing Balance.',
    downloadPath: 'Net Banking → My Accounts → Account Statement → Excel format',
    notes: [
      'HDFC uses "Value Dat" (not "Value Date") as the column name — Synergy handles this automatically',
      'Narrations include UPI IDs, NEFT reference numbers, and branch codes — edit in the review table before posting if needed',
      'Credit card payment entries appear as "CC PAY" in narration — assign to your credit card liability ledger',
      'EMI debits appear as "EMI AMT" — assign to the relevant loan account ledger'
    ],
    commonLedgers: [
      { narrationKeyword: 'UPI', suggestedLedger: 'Assign to the specific party or UPI Expenses' },
      { narrationKeyword: 'NEFT/RTGS', suggestedLedger: 'Assign to the party name in the narration' },
      { narrationKeyword: 'ATM', suggestedLedger: 'Cash Account' },
      { narrationKeyword: 'INTEREST', suggestedLedger: 'Bank Interest Received or Bank Charges' },
      { narrationKeyword: 'CHG', suggestedLedger: 'Bank Charges' }
    ]
  },
  {
    slug: 'sbi',
    name: 'SBI',
    fullName: 'State Bank of India',
    keyword: 'SBI bank statement to Tally',
    description: 'Import SBI (State Bank of India) Excel bank statement directly to Tally using Synergy Automation. Step-by-step guide.',
    excelFormat: 'SBI exports statements via YONO or SBI Online. Columns: Txn Date, Value Date, Description, Ref No./Cheque No., Debit, Credit, Balance.',
    downloadPath: 'SBI Online / YONO → Account Statement → Excel / CSV format',
    notes: [
      'SBI narrations are often long — include branch name and transaction reference',
      'SBI CSV exports sometimes have extra header rows — use the Excel (.xlsx) download from net banking for cleanest results',
      'Account statement from SBI branch (physical) often comes as PDF — convert to Excel first',
      'Passbook entries and digital statement may differ in narration format'
    ],
    commonLedgers: [
      { narrationKeyword: 'UPI', suggestedLedger: 'UPI Expenses or specific party' },
      { narrationKeyword: 'RTGS', suggestedLedger: 'Party ledger mentioned in narration' },
      { narrationKeyword: 'INT.', suggestedLedger: 'Bank Interest Received' },
      { narrationKeyword: 'CHRG', suggestedLedger: 'Bank Charges' },
      { narrationKeyword: 'ATM', suggestedLedger: 'Cash Account' }
    ]
  },
  {
    slug: 'icici',
    name: 'ICICI Bank',
    fullName: 'ICICI Bank Limited',
    keyword: 'ICICI bank statement to Tally',
    description: 'Import ICICI Bank Excel statement directly to Tally Prime or ERP 9 with Synergy Automation. No XML export needed.',
    excelFormat: 'ICICI Bank exports as .xlsx. Columns: Transaction Date, Value Date, Transaction Remarks, Cheque Number, Withdrawal Amount (INR), Deposit Amount (INR), Balance (INR).',
    downloadPath: 'ICICI Internet Banking → My Accounts → Account Statement → Download (Excel)',
    notes: [
      'ICICI uses "Withdrawal Amount" and "Deposit Amount" instead of Debit/Credit',
      'Narrations include IMPS/NEFT/UPI reference numbers',
      'iMobile statement downloads may have a slightly different format — use net banking Excel for best results',
      'FD interest credit appears as "INT PD" in narrations'
    ],
    commonLedgers: [
      { narrationKeyword: 'IMPS', suggestedLedger: 'Party ledger or IMPS Transfers' },
      { narrationKeyword: 'UPI', suggestedLedger: 'Specific party or UPI Expenses' },
      { narrationKeyword: 'INT PD', suggestedLedger: 'Interest on FD Received' },
      { narrationKeyword: 'NACH', suggestedLedger: 'EMI / Loan Account' },
      { narrationKeyword: 'CHG', suggestedLedger: 'Bank Charges' }
    ]
  },
  {
    slug: 'axis',
    name: 'Axis Bank',
    fullName: 'Axis Bank Limited',
    keyword: 'Axis bank statement to Tally',
    description: 'Import Axis Bank Excel statement directly to Tally using Synergy Automation. Step-by-step guide with common ledger mappings.',
    excelFormat: 'Axis Bank exports as .xlsx. Columns: Tran Date, CHQNO, Particulars, DR, CR, BAL.',
    downloadPath: 'Axis Net Banking → Accounts → Account Statement → Excel format',
    notes: [
      'Axis uses short column names: DR (debit), CR (credit), BAL (balance)',
      'Particulars column contains transaction description — often includes UPI IDs or NEFT references',
      'Axis narrations for UPI: format is UPI/timestamp/merchant-name/VPA',
      'NACH mandates (auto-debits for EMI, insurance) appear with "NACH" prefix'
    ],
    commonLedgers: [
      { narrationKeyword: 'UPI', suggestedLedger: 'Specific party or UPI category' },
      { narrationKeyword: 'NACH', suggestedLedger: 'EMI / recurring payment ledger' },
      { narrationKeyword: 'INT', suggestedLedger: 'Bank Interest Received' },
      { narrationKeyword: 'CHG', suggestedLedger: 'Bank Charges' },
      { narrationKeyword: 'ATM', suggestedLedger: 'Cash Account' }
    ]
  },
  {
    slug: 'kotak',
    name: 'Kotak Bank',
    fullName: 'Kotak Mahindra Bank Limited',
    keyword: 'Kotak bank statement to Tally',
    description: 'Import Kotak Mahindra Bank statement directly to Tally Prime or ERP 9. Auto-detect format, review and post.',
    excelFormat: 'Kotak exports as .xlsx. Columns: Transaction Date, Transaction Id, Particulars, Debit, Credit, Balance.',
    downloadPath: 'Kotak Net Banking → Statement → Download Statement → Excel format',
    notes: [
      'Kotak includes a Transaction ID column which is useful for reconciliation',
      'Sweep-in/sweep-out entries (linked savings account) appear with "SWPIN"/"SWPOUT" prefix',
      'Kotak Edge account statements have the same format as regular savings',
      '811 account statements use the same column structure'
    ],
    commonLedgers: [
      { narrationKeyword: 'UPI', suggestedLedger: 'Party ledger or UPI Expenses' },
      { narrationKeyword: 'SWPIN', suggestedLedger: 'Linked Savings/FD Account' },
      { narrationKeyword: 'NACH', suggestedLedger: 'EMI / Auto-debit Ledger' },
      { narrationKeyword: 'INT', suggestedLedger: 'Bank Interest Received' }
    ]
  },
  {
    slug: 'pnb',
    name: 'PNB',
    fullName: 'Punjab National Bank',
    keyword: 'PNB bank statement to Tally',
    description: 'Import Punjab National Bank (PNB) Excel statement to Tally using Synergy Automation. Direct posting, no XML needed.',
    excelFormat: 'PNB exports via PNB ONE or internet banking. Columns typically: Date, Particulars, Cheque No., Debit, Credit, Balance.',
    downloadPath: 'PNB Net Banking → Account Statement → Download (Excel/XLS)',
    notes: [
      'PNB older accounts may have XLS format (not XLSX) — both work with Synergy Automation',
      'Government payment entries (tax, challans) appear with "GOV" or "CMP" prefix in narrations',
      'PNB One app statement format is identical to web banking download'
    ],
    commonLedgers: [
      { narrationKeyword: 'GOV', suggestedLedger: 'Tax Paid / Government Dues' },
      { narrationKeyword: 'UPI', suggestedLedger: 'Party or UPI Expenses' },
      { narrationKeyword: 'INT', suggestedLedger: 'Bank Interest Received' },
      { narrationKeyword: 'CHG', suggestedLedger: 'Bank Charges' }
    ]
  },
  {
    slug: 'bank-of-baroda',
    name: 'Bank of Baroda',
    fullName: 'Bank of Baroda',
    keyword: 'Bank of Baroda statement to Tally',
    description: 'Import Bank of Baroda (BOB) Excel statement to Tally Prime or ERP 9 using Synergy Automation.',
    excelFormat: 'BOB exports via bob World or BOB internet banking. Columns: Date, Narration, Ref/Chq No., Value Dt, Withdrawal Amt, Deposit Amt, Closing Balance.',
    downloadPath: 'BOB Net Banking → Account Statement → Export to Excel',
    notes: [
      'BOB uses "Withdrawal Amt" and "Deposit Amt" instead of Debit/Credit',
      'bob World app and web banking produce the same Excel format',
      'Baroda Kisan accounts (agricultural) use the same column structure as savings accounts'
    ],
    commonLedgers: [
      { narrationKeyword: 'UPI', suggestedLedger: 'Party or UPI Expenses' },
      { narrationKeyword: 'INT', suggestedLedger: 'Bank Interest Received' },
      { narrationKeyword: 'CHG', suggestedLedger: 'Bank Charges' },
      { narrationKeyword: 'NEFT', suggestedLedger: 'Party mentioned in narration' }
    ]
  },
  {
    slug: 'yes-bank',
    name: 'Yes Bank',
    fullName: 'YES Bank Limited',
    keyword: 'Yes Bank statement to Tally',
    description: 'Import YES Bank Excel bank statement directly to Tally Prime or ERP 9 using Synergy Automation.',
    excelFormat: 'YES Bank exports as .xlsx. Columns: Date, Remarks, Withdrawal Amount, Deposit Amount, Balance.',
    downloadPath: 'YES Bank Net Banking → My Accounts → Account Statement → Download (Excel)',
    notes: [
      'YES Bank uses "Remarks" instead of Narration/Particulars',
      'YES FIRST and YES Prosperity accounts use the same Excel format',
      'Remarks column contains UPI IDs, NEFT/RTGS reference numbers'
    ],
    commonLedgers: [
      { narrationKeyword: 'UPI', suggestedLedger: 'Party or UPI Expenses' },
      { narrationKeyword: 'NACH', suggestedLedger: 'EMI / Auto-debit Ledger' },
      { narrationKeyword: 'INT', suggestedLedger: 'Bank Interest Received' }
    ]
  }
];

export function getBank(slug) {
  return banks.find(b => b.slug === slug) || null;
}
