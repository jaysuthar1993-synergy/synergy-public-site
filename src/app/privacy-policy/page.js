import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Synergy Connector and Synergy Automation. How we collect, use, and protect your data.',
  alternates: { canonical: 'https://synergyfuturecorp.com/privacy-policy' },
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333'
    }}>
      <nav style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: '#4F46E5', textDecoration: 'none' }}>← Synergy Automation</Link>
      </nav>

      <h1 style={{ borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>Privacy Policy</h1>
      <p><strong>Synergy Connector &amp; Synergy Automation</strong></p>
      <p><strong>Last updated:</strong> 15 January 2026</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>1. Introduction</h2>
      <p>Synergy Futurecorp OPC Pvt Ltd (&ldquo;Synergy&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) provides accounting automation tools including Synergy Connector (.exe) and Synergy Automation (web access) for use with Tally and related systems.</p>
      <p>This Privacy Policy explains how we collect, use, store, and protect information when you use our products, in compliance with the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;).</p>
      <p>By using Synergy products, you consent to the collection and processing of data as described in this Privacy Policy.</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>2. Scope</h2>
      <p>This policy applies to:</p>
      <ul>
        <li>Synergy Connector (desktop executable)</li>
        <li>Synergy Automation (web application)</li>
        <li>Related services operated in India</li>
      </ul>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>3. Information We Collect</h2>
      <h3>a) Account Information</h3>
      <ul>
        <li>Name</li>
        <li>Email address (used for login and communication)</li>
        <li>Business or firm name (if provided)</li>
      </ul>
      <h3>b) Accounting &amp; Automation Data</h3>
      <ul>
        <li>Bank statement data (account numbers, transactions, balances)</li>
        <li>Ledger names</li>
        <li>Voucher and transaction details</li>
        <li>Configuration and mapping data</li>
      </ul>
      <p style={{ background: '#f0f4ff', padding: '12px', borderRadius: '4px' }}>
        <strong>Important:</strong> Synergy stores this data to process and post entries into Tally. We do not analyze, sell, profile, or use accounting data for any other purpose. Your data is never shared with third parties.
      </p>
      <h3>c) Technical &amp; Usage Data</h3>
      <ul>
        <li>Login timestamps</li>
        <li>Error logs</li>
        <li>System and application diagnostics</li>
      </ul>
      <p>No sensitive financial values are intentionally logged.</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>4. How We Use Information</h2>
      <p>We use collected information strictly to:</p>
      <ul>
        <li>Authenticate users</li>
        <li>Perform accounting automation</li>
        <li>Maintain system reliability</li>
        <li>Provide support and troubleshooting</li>
        <li>Meet legal and regulatory obligations</li>
      </ul>
      <p><strong>We do NOT:</strong></p>
      <ul>
        <li>Sell or rent data</li>
        <li>Use data for advertising or profiling</li>
        <li>Provide financial, tax, or audit advice</li>
      </ul>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>5. Data Storage &amp; Processing</h2>
      <ul>
        <li>Desktop processing occurs locally on the user&apos;s system via Synergy Connector</li>
        <li>Web data is stored on secure cloud infrastructure within India</li>
        <li>Third-party services may be used strictly for system functionality (not for data resale or profiling)</li>
        <li>All data transmission is encrypted using industry-standard protocols</li>
      </ul>
      <p>While we apply reasonable security measures, no system is completely secure.</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>6. Data Sharing</h2>
      <p>We do not share user data with third parties except:</p>
      <ul>
        <li>When required by Indian law or court order</li>
        <li>With explicit user consent</li>
        <li>With essential service providers strictly for service operation (under confidentiality obligations)</li>
      </ul>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>7. Data Retention</h2>
      <ul>
        <li>Account data is retained while your account is active</li>
        <li>Accounting data processed via Connector is not stored on our servers (local processing only)</li>
        <li>Dashboard data is retained only as long as required for service operation</li>
        <li>Upon account deletion request, data will be removed within 30 days</li>
        <li>Minimal logs may be retained for security and legal compliance (up to 1 year)</li>
      </ul>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>8. Your Rights</h2>
      <p>Under the DPDP Act, 2023, you have the right to:</p>
      <ul>
        <li>Access your personal data held by us</li>
        <li>Correct inaccurate or incomplete data</li>
        <li>Erase your data (subject to legal retention requirements)</li>
        <li>Withdraw consent at any time</li>
        <li>File a grievance with us or the Data Protection Board of India</li>
      </ul>
      <p>To exercise these rights, contact us at the email provided below.</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>9. User Responsibilities</h2>
      <p>Users (including accountants, CAs, and businesses) are responsible for:</p>
      <ul>
        <li>Verifying all outputs before use in Tally or statutory filings</li>
        <li>Maintaining statutory and regulatory compliance</li>
        <li>Keeping backups of financial data</li>
        <li>Ensuring correct configuration and input data</li>
      </ul>
      <p><strong>Synergy is an automation tool, not a substitute for professional judgment or audit.</strong></p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2 style={{ color: '#c53030' }}>10. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law:</p>
      <ul>
        <li>Synergy is not liable for financial loss, penalties, tax issues, or indirect damages arising from use of the software</li>
        <li>We are not responsible for errors arising from Tally, bank data formats, or user configuration</li>
        <li>Total liability shall not exceed the fees paid by the user in the preceding 12 months, if any</li>
        <li>Users must independently verify all processed data before submission to any authority</li>
      </ul>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>11. Security Measures</h2>
      <p>We implement reasonable security safeguards including:</p>
      <ul>
        <li>Encryption of data in transit and at rest</li>
        <li>Access controls and authentication</li>
        <li>Regular security monitoring</li>
        <li>Secure cloud infrastructure hosted in India</li>
      </ul>
      <p>In the event of a data breach likely to cause harm, we will notify affected users and the Data Protection Board as required by law.</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>12. India-Only Use</h2>
      <p>Synergy products are intended only for use within India and are governed exclusively by Indian laws. Any disputes shall be subject to the jurisdiction of courts in Gandhinagar, Gujarat.</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>13. Children&apos;s Privacy</h2>
      <p>Synergy services are intended for business use by adults (18 years or older). We do not knowingly collect data from individuals under 18. If we become aware of such collection, we will delete the data promptly.</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>14. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or dashboard notification. Continued use of the products after such notice constitutes acceptance of the updated policy.</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <h2>15. Contact</h2>
      <p>For privacy-related questions, data requests, or grievances:</p>
      <p><strong>Email:</strong> <a href="mailto:support@synergyfuturecorp.com">support@synergyfuturecorp.com</a></p>
      <p><strong>Company:</strong> Synergy Futurecorp OPC Pvt Ltd</p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <p style={{ color: '#666', fontSize: '14px' }}>
        © 2026 Synergy Future Corp · <Link href="/">Back to Home</Link>
      </p>
    </div>
  );
}
