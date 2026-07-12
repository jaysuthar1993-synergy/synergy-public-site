'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getUpdatesByType } from '../../data/updatesData';

const govtUpdates = getUpdatesByType('govt');

const KP_COLORS = [
  { bg: '#f0fdf4', border: '#86efac', label: '#166534' },
  { bg: '#eff6ff', border: '#93c5fd', label: '#1e40af' },
  { bg: '#fdf4ff', border: '#d8b4fe', label: '#7e22ce' },
];

function KeyPointsInfographic({ keyPoints }) {
  if (!keyPoints || keyPoints.length === 0) return null;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 8,
      margin: '14px 0',
    }}>
      {keyPoints.map((kp, i) => {
        const c = KP_COLORS[i % KP_COLORS.length];
        return (
          <div key={i} style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: c.label,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 5,
            }}>
              {kp.label}
            </div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.45 }}>
              {kp.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GovtUpdateCard({ update }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{
          background: '#fef3c7',
          color: '#92400e',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          marginTop: 2,
          flexShrink: 0,
        }}>
          GOVT
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px 0' }}>
            {update.source} · {(() => { const d = new Date(update.date); return isNaN(d) ? update.date : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); })()}
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            {update.title}
          </h3>

          {/* Summary always visible */}
          <p style={{ fontSize: 14, color: '#475569', margin: '0 0 8px 0', lineHeight: 1.65 }}>
            {update.summary}
          </p>

          {/* Expanded content */}
          {expanded && (
            <div>
              {/* Key points infographic */}
              <KeyPointsInfographic keyPoints={update.keyPoints} />

              {/* Tally impact */}
              {update.tallyImpact && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 8,
                  padding: '11px 14px',
                  fontSize: 13,
                  color: '#0369a1',
                  margin: '14px 0',
                  lineHeight: 1.55,
                }}>
                  <strong>Step-by-step in Tally:</strong> {update.tallyImpact}
                </div>
              )}

              {/* Links row */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
                {update.relatedSlug && (
                  <Link href={`/blog/${update.relatedSlug}`} style={{
                    fontSize: 13,
                    color: '#4F46E5',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}>
                    Full guide →
                  </Link>
                )}
                {update.url && (
                  <a
                    href={update.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}
                  >
                    Official source →
                  </a>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4F46E5',
              fontSize: 13,
              cursor: 'pointer',
              padding: 0,
              marginTop: 10,
              display: 'block',
            }}
          >
            {expanded ? 'Show less ↑' : 'What does this mean for me? ↓'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UpdatesClient() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <Link href="/" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: 14 }}>← Synergy Automation</Link>
        <span style={{ color: '#cbd5e1' }}>|</span>
        <Link href="/blog" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14 }}>Knowledge Hub</Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
            GST, Income Tax &amp; Tally Updates
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Plain-English summaries of government circulars that affect Indian accountants.
            Updated continuously from CBIC, CBDT, GST Portal, MCA and RBI.
          </p>
        </div>

        {govtUpdates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <p style={{ fontSize: 16 }}>Updates will appear here shortly.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Monitoring CBIC, CBDT, GST Portal, MCA21, RBI and PIB Finance.</p>
          </div>
        ) : (
          govtUpdates.map(u => <GovtUpdateCard key={u.id} update={u} />)
        )}

        <div style={{
          background: '#4F46E5',
          borderRadius: 12,
          padding: '24px 28px',
          marginTop: 40,
          color: '#fff',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px 0' }}>
            Post Bank Statements Directly to Tally — Free
          </h3>
          <p style={{ fontSize: 14, opacity: 0.85, margin: '0 0 16px 0' }}>
            No XML. No manual import. Review every entry before it reaches Tally.
          </p>
          <a
            href="https://app.synergyfuturecorp.com/register"
            style={{
              background: '#fff',
              color: '#4F46E5',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Get Free Access →
          </a>
        </div>
      </div>

      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: 13,
        color: '#94a3b8',
      }}>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Synergy Automation</Link>
        {' · '}
        <Link href="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Knowledge Hub</Link>
        {' · '}
        <Link href="/privacy-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
        {' · '}
        <span>© 2026 Synergy Future Corp</span>
      </footer>
    </div>
  );
}
