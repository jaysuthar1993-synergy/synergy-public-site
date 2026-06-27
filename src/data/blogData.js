export const blogPosts = [
  {
    slug: 'excel-to-tally-complete-guide',
    title: 'Excel to Tally: The Complete Guide for Indian Accountants (2026)',
    tag: 'Guide',
    published: '2026-06-14',
    updated: '2026-06-14',
    description: 'Everything you need to know about importing Excel bank statements into Tally — formats supported, common errors, and the fastest way to post entries directly without XML.',
    keywords: 'excel to tally, bank statement to tally, tally prime bank import, tally erp 9 excel import',
    content: [
      {
        type: 'intro',
        text: 'If you are an accountant or CA in India using Tally Prime or Tally ERP 9, you have probably spent hours manually typing bank entries or wrestling with XML converter tools. This guide covers everything you need to know about getting Excel bank statements into Tally — accurately, quickly, and without the usual frustration.'
      },
      {
        type: 'h2',
        text: 'Why Excel Bank Statements Are the Standard'
      },
      {
        type: 'p',
        text: 'Almost every Indian bank — HDFC, SBI, ICICI, Axis, Kotak, PNB, Bank of Baroda, Yes Bank — allows you to download your bank statement as an Excel file (.xlsx or .xls) from net banking. This Excel file contains all transactions: date, narration (description), debit amount, credit amount, and running balance.'
      },
      {
        type: 'p',
        text: 'The challenge: Tally does not directly read Excel files. You need to either type each entry manually into Tally (slow, error-prone) or find a way to convert the Excel data into a format Tally understands.'
      },
      {
        type: 'h2',
        text: 'Three Ways to Get Excel Bank Data into Tally'
      },
      {
        type: 'h3',
        text: '1. Manual Entry (Not Recommended)'
      },
      {
        type: 'p',
        text: 'Opening Tally and typing each transaction one by one. For a bank account with 200 transactions a month, this takes 3–5 hours and introduces errors — wrong amounts, wrong dates, wrong narrations.'
      },
      {
        type: 'h3',
        text: '2. XML Converter Tools (Free but Extra Steps)'
      },
      {
        type: 'p',
        text: 'Several free online tools convert your Excel bank statement into a Tally XML file. You then go into Tally and import that XML file using the Data Import feature. This is faster than manual entry but requires: downloading a file, opening Tally\'s import screen, browsing to the file, running the import. It also provides no way to review entries before they enter Tally.'
      },
      {
        type: 'h3',
        text: '3. Direct Tally Posting (Fastest, Recommended)'
      },
      {
        type: 'p',
        text: 'Synergy Automation connects directly to your running Tally software. You upload the Excel file, review every entry in a table (edit narrations, assign ledgers, skip entries), then click Post. Entries appear instantly in your Tally company — no XML file, no import dialog, no extra steps.'
      },
      {
        type: 'h2',
        text: 'Which Indian Bank Formats Does Synergy Automation Support?'
      },
      {
        type: 'p',
        text: 'Synergy Automation auto-detects the format of your uploaded Excel bank statement. It works with most major Indian banks including:'
      },
      {
        type: 'list',
        items: [
          'HDFC Bank — Excel statements from net banking',
          'State Bank of India (SBI) — all account types',
          'ICICI Bank — savings, current, OD accounts',
          'Axis Bank — Excel export from Axis Bank net banking',
          'Kotak Mahindra Bank',
          'Punjab National Bank (PNB)',
          'Bank of Baroda (BOB)',
          'Yes Bank',
          'IDFC First Bank',
          'Canara Bank',
          'Union Bank of India',
          'IndusInd Bank'
        ]
      },
      {
        type: 'p',
        text: 'No manual template selection. The system reads the column headers and detects the bank automatically.'
      },
      {
        type: 'h2',
        text: 'Step-by-Step: Excel Bank Statement to Tally Using Synergy Automation'
      },
      {
        type: 'h3',
        text: 'Step 1: Download Your Bank Statement as Excel'
      },
      {
        type: 'p',
        text: 'Log into your bank\'s net banking portal. Go to Statements or Account Summary. Select date range. Download as Excel (.xlsx or .xls). Do not convert it to CSV — use the Excel format.'
      },
      {
        type: 'h3',
        text: 'Step 2: Open Synergy Automation and Select Your Company'
      },
      {
        type: 'p',
        text: 'Log into Synergy Automation. Make sure Tally is open on your system with the company you want to post to. Select the company in the Synergy Automation dashboard. Make sure the Synergy Connector (lightweight desktop app) is running.'
      },
      {
        type: 'h3',
        text: 'Step 3: Upload the Excel File'
      },
      {
        type: 'p',
        text: 'Drag and drop your Excel bank statement file into the upload area, or click to browse. The system automatically detects your bank and parses all transactions. You will see a count of entries found.'
      },
      {
        type: 'h3',
        text: 'Step 4: Review Entries'
      },
      {
        type: 'p',
        text: 'Every entry appears in a review table: date, narration, debit/credit amount, and a Tally ledger account column. You can: edit narrations for clarity, change ledger account assignments, skip entries you do not want in Tally. Review everything before a single entry touches Tally.'
      },
      {
        type: 'h3',
        text: 'Step 5: Post to Tally'
      },
      {
        type: 'p',
        text: 'Click Post. All approved entries appear instantly in your open Tally company as bank payment and receipt vouchers. Open Tally and verify — the entries are there. No XML file was downloaded, no import dialog was opened.'
      },
      {
        type: 'h2',
        text: 'Common Errors When Importing Bank Statements to Tally'
      },
      {
        type: 'h3',
        text: '1. Duplicate Entries'
      },
      {
        type: 'p',
        text: 'If you upload the same statement twice, you will get duplicate entries in Tally. To avoid this, keep track of the date range you have already posted. If duplicates appear, open the bank ledger in Tally, identify entries with the same date and amount, and delete the extra vouchers.'
      },
      {
        type: 'h3',
        text: '2. Wrong Ledger Assignment'
      },
      {
        type: 'p',
        text: 'NEFT transfers, UPI payments, bank charges, and interest credits all need different ledger accounts in Tally. In the Synergy Automation review table, you assign the correct ledger for each transaction before anything posts to Tally.'
      },
      {
        type: 'h3',
        text: '3. Date Format Mismatch'
      },
      {
        type: 'p',
        text: 'Some bank Excel files use DD-MM-YYYY, others use DD/MM/YYYY or YYYY-MM-DD. Synergy Automation handles all standard Indian date formats automatically.'
      },
      {
        type: 'h2',
        text: 'Direct Posting vs XML Import: Which Is Better?'
      },
      {
        type: 'p',
        text: 'If speed and simplicity matter, direct posting wins. With XML import tools, the process is: download Excel → convert to XML → open Tally → go to Data Import → browse to file → run import → verify entries. With direct posting: upload Excel → review → click Post. Three steps vs seven. No files downloaded, no Tally import screens to navigate.'
      },
      {
        type: 'h2',
        text: 'Frequently Asked Questions'
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Does Synergy Automation work with Tally Prime 6.0?',
            a: 'Yes. Synergy Automation works with Tally Prime all versions including 6.0, and Tally ERP 9. The Synergy Connector installs on the same PC as Tally and handles the direct posting.'
          },
          {
            q: 'Can I use Synergy Automation for multiple bank accounts?',
            a: 'Yes. You can upload statements from multiple bank accounts and post them to separate bank ledgers in Tally. Each bank account in Tally corresponds to a bank ledger you map during the review step.'
          },
          {
            q: 'What if my bank is not listed?',
            a: 'Synergy Automation is flexible and works with virtually any Indian bank Excel statement that has standard column headers — Date, Narration (or Description/Particulars/Remarks), Debit, Credit, and Balance. Even if your bank is not in our listed banks, upload your file and it will very likely work. Contact support@synergyfuturecorp.com if you need help with a specific format.'
          }
        ]
      }
    ]
  },
  {
    slug: 'direct-posting-vs-xml-import',
    title: 'Direct Tally Posting vs XML File Import: What\'s the Difference?',
    tag: 'Explainer',
    published: '2026-06-14',
    updated: '2026-06-14',
    description: 'Two ways to get bank data into Tally. One requires downloading a file and manually importing it. The other posts directly. Here is why it matters for accountants who do this every month.',
    keywords: 'tally xml import, direct tally posting, excel to tally xml, tally bank entry automation',
    content: [
      {
        type: 'intro',
        text: 'There are two fundamentally different ways to get Excel bank statement data into Tally. Most accountants use one without realising the other exists. This article explains both — and why the difference matters if you are doing this every month.'
      },
      {
        type: 'h2',
        text: 'Method 1: XML File Import'
      },
      {
        type: 'p',
        text: 'XML (eXtensible Markup Language) is the format Tally uses for data import and export. The standard workflow looks like this:'
      },
      {
        type: 'list',
        items: [
          'Download your bank statement as Excel from net banking',
          'Upload it to an online converter tool',
          'The tool converts the Excel data into a Tally XML file',
          'You download the XML file to your computer',
          'Open Tally → Gateway of Tally → Import Data',
          'Browse to the downloaded XML file',
          'Import runs — entries appear in Tally'
        ]
      },
      {
        type: 'p',
        text: 'This works. But it is seven steps, you download a file you do not really need, and there is no way to review individual entries before they hit Tally. If anything goes wrong (wrong ledger, duplicate entry), you find out after the fact.'
      },
      {
        type: 'h2',
        text: 'Method 2: Direct Posting via Tally Connector'
      },
      {
        type: 'p',
        text: 'A Tally Connector is a small desktop application that runs on the same PC as Tally. It creates a local bridge between a web application and your running Tally instance. When you post from the web app, the Connector receives the data and writes entries directly into the open Tally company — no file needed.'
      },
      {
        type: 'p',
        text: 'The workflow with Synergy Automation:'
      },
      {
        type: 'list',
        items: [
          'Upload Excel bank statement to Synergy Automation',
          'Review every entry in a table (edit, skip, assign ledgers)',
          'Click Post — entries appear in Tally instantly'
        ]
      },
      {
        type: 'h2',
        text: 'Side-by-Side Comparison'
      },
      {
        type: 'table',
        headers: ['', 'XML Import', 'Direct Posting (Synergy Automation)'],
        rows: [
          ['Steps to complete', '7 steps', '3 steps'],
          ['File download needed', 'Yes (XML file)', 'No'],
          ['Review & assign ledgers before posting', 'Not possible', 'Yes — edit narrations, assign Tally ledgers, skip entries'],
          ['Works with Tally Prime 6.0', 'Yes', 'Yes'],
          ['Works with Tally ERP 9', 'Yes', 'Yes'],
          ['Free to use', 'Yes', 'Yes'],
        ]
      },
      {
        type: 'h2',
        text: 'When Would You Still Use XML Import?'
      },
      {
        type: 'p',
        text: 'XML import is useful if: Tally is on a separate server you cannot install software on, you need to prepare entries in advance and import them later, or your workflow requires an XML file for audit trail purposes. For most solo accountants and small CA practices doing monthly bank entry, direct posting is faster and less error-prone.'
      },
      {
        type: 'h2',
        text: 'Frequently Asked Questions'
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Does the Synergy Connector need to stay running all the time?',
            a: 'No. Run the Synergy Connector only when you need to post entries. It is a small app you start when you open Tally to do bank entry work, and close after.'
          },
          {
            q: 'Is direct posting safe — can it corrupt my Tally data?',
            a: 'Direct posting uses the same Tally API that Tally itself uses internally. Entries are created exactly as if you typed them in Tally. The review step before posting lets you verify everything before it touches Tally data.'
          }
        ]
      }
    ]
  },
  // tally-bank-entry-errors article removed — content had inaccurate feature claims; will rewrite when accurate
  // placeholder to avoid merge conflicts:
  {
    slug: '_removed_tally-bank-entry-errors',
    hidden: true,
    title: '',
    tag: '',
    published: '2026-06-14',
    updated: '2026-06-14',
    description: '',
    keywords: '',
    content: [
      {
        type: 'intro',
        text: 'Bank entry errors in Tally cost time and create reconciliation headaches. Most errors are preventable. Here are the seven most common ones — and how to avoid each before the entry ever reaches Tally.'
      },
      {
        type: 'h2',
        text: '1. Duplicate Entries'
      },
      {
        type: 'p',
        text: 'Importing the same statement twice, or overlapping date ranges, creates duplicate entries. Your bank balance in Tally shows double the actual figure.'
      },
      {
        type: 'p',
        text: 'How to avoid: Track which date ranges you have already imported. Synergy Automation flags entries that match previously posted transactions and asks you to confirm before proceeding.'
      },
      {
        type: 'h2',
        text: '2. Wrong Ledger Assignment'
      },
      {
        type: 'p',
        text: 'A NEFT payment to a supplier should go to that supplier\'s ledger. Bank charges should go to Bank Charges account. Interest received should go to Interest Received account. Getting this wrong means your P&L and balance sheet are wrong.'
      },
      {
        type: 'p',
        text: 'How to avoid: Use the review table to carefully assign each transaction to the correct Tally ledger before posting. Synergy Automation shows your full Tally chart of accounts in a dropdown — select the right one for each entry.'
      },
      {
        type: 'h2',
        text: '3. Wrong Date'
      },
      {
        type: 'p',
        text: 'Indian bank statements use several date formats: DD-MM-YYYY, DD/MM/YYYY, D-Mon-YYYY (like 14-Jun-2026). If the parser misreads the format, entries land on the wrong date.'
      },
      {
        type: 'p',
        text: 'How to avoid: Always verify date parsing by checking the first few entries in the review table before posting. Synergy Automation displays the parsed date clearly and handles all standard Indian bank date formats.'
      },
      {
        type: 'h2',
        text: '4. Swapped Debit and Credit'
      },
      {
        type: 'p',
        text: 'Some bank statements show debits as negative numbers, others as positive numbers in a Debit column. A wrong mapping creates entries where receipts appear as payments and vice versa.'
      },
      {
        type: 'p',
        text: 'How to avoid: Review the debit/credit mapping before posting. Synergy Automation auto-detects column structure but displays each entry\'s type (receipt/payment) in the review table for you to verify.'
      },
      {
        type: 'h2',
        text: '5. Missing or Garbled Narrations'
      },
      {
        type: 'p',
        text: 'Bank narrations like "UPI/123456/JOHN SMITH/OKSBI" are not useful in Tally. If you post them as-is, your ledger is hard to read and audit.'
      },
      {
        type: 'p',
        text: 'How to avoid: Edit narrations in the review step before posting. Change "UPI/2343344/SHARMA TRADERS/HDFC" to "Payment — Sharma Traders". Synergy Automation lets you edit each narration before it reaches Tally.'
      },
      {
        type: 'h2',
        text: '6. Wrong Bank Ledger in Tally'
      },
      {
        type: 'p',
        text: 'If you have multiple bank accounts — HDFC Current and SBI Savings — and you post entries to the wrong bank ledger in Tally, your reconciliation will never balance.'
      },
      {
        type: 'p',
        text: 'How to avoid: In Synergy Automation, select the correct bank ledger at the start of the upload. The system remembers your last selection per bank account.'
      },
      {
        type: 'h2',
        text: '7. Excel File Contains Header/Footer Rows'
      },
      {
        type: 'p',
        text: 'Many bank statement Excel files have extra rows: account details at the top (account number, IFSC code, name) and summary rows at the bottom (opening balance, closing balance, total). If these are parsed as transactions, you get garbage entries.'
      },
      {
        type: 'p',
        text: 'How to avoid: Synergy Automation automatically skips header and footer rows during parsing. The review table shows only actual transaction rows, so you can verify before posting.'
      },
      {
        type: 'h2',
        text: 'Summary: Prevention Checklist'
      },
      {
        type: 'list',
        items: [
          'Track date ranges already imported to avoid duplicates',
          'Review and assign ledger accounts for each entry before posting',
          'Verify date format in the review table on first upload from a new bank',
          'Check debit/credit direction on first upload',
          'Edit garbled narrations before posting',
          'Select the correct bank ledger at upload time',
          'Verify that parser skipped header/footer rows (check first and last entry in review)'
        ]
      },
      {
        type: 'p',
        text: 'All seven of these are addressed by reviewing entries before they reach Tally — which is exactly what the review step in Synergy Automation is designed for.'
      },
      {
        type: 'h2',
        text: 'Frequently Asked Questions'
      },
      {
        type: 'faq',
        items: [
          {
            q: 'How do I fix duplicate entries already in Tally?',
            a: 'In Tally, go to the bank ledger and identify duplicates by comparing entries with your bank statement. Delete the duplicate vouchers. Then use Synergy Automation\'s duplicate detection on future imports to prevent this from happening again.'
          },
          {
            q: 'Can Synergy Automation detect if I upload the wrong bank\'s statement?',
            a: 'The system auto-detects the bank from the Excel format. If it cannot match the format, it will ask you to confirm column mapping before proceeding — which serves as a check.'
          }
        ]
      }
    ]
  }
];

export function getBlogPost(slug) {
  return blogPosts.find(p => p.slug === slug) || null;
}
