'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getUpdatesByType } from '../../data/updatesData';

const govtUpdates = getUpdatesByType('govt');
const videoUpdates = getUpdatesByType('video');

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
        }}>
          GOVT
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px 0' }}>
            {update.source} · {new Date(update.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0', lineHeight: 1.4 }}>
            {update.title}
          </h3>
          {expanded && (
            <>
              <p style={{ fontSize: 14, color: '#475569', margin: '0 0 12px 0', lineHeight: 1.6 }}>{update.summary}</p>
              {update.tallyImpact && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#0369a1',
                  marginBottom: 12,
                }}>
                  <strong>Tally impact:</strong> {update.tallyImpact}
                </div>
              )}
              {update.url && (
                <a
                  href={update.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#4F46E5', textDecoration: 'none' }}
                >
                  View official source →
                </a>
              )}
            </>
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
              marginTop: 6,
            }}
          >
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoUpdateCard({ update }) {
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
          background: '#fee2e2',
          color: '#991b1b',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          marginTop: 2,
        }}>
          VIDEO
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px 0' }}>
            {update.source} · {new Date(update.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0', lineHeight: 1.4 }}>
            {update.title}
          </h3>
          <p style={{ fontSize: 14, color: '#475569', margin: '0 0 8px 0', lineHeight: 1.6 }}>{update.summary}</p>
          {update.url && (
            <a
              href={update.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#dc2626', textDecoration: 'none' }}
            >
              Watch on YouTube →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UpdatesClient() {
  const [activeTab, setActiveTab] = useState('govt');

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
            GST, Income Tax &amp; CA Updates
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Daily updates for Indian accountants — government circulars, CBIC/CBDT notices, and CA community highlights.
            Updated automatically every morning.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#e2e8f0', borderRadius: 8, padding: 4 }}>
          <button
            onClick={() => setActiveTab('govt')}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              background: activeTab === 'govt' ? '#fff' : 'transparent',
              color: activeTab === 'govt' ? '#1e293b' : '#64748b',
              boxShadow: activeTab === 'govt' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            Govt Updates ({govtUpdates.length})
          </button>
          <button
            onClick={() => setActiveTab('video')}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              background: activeTab === 'video' ? '#fff' : 'transparent',
              color: activeTab === 'video' ? '#1e293b' : '#64748b',
              boxShadow: activeTab === 'video' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            CA Videos ({videoUpdates.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'govt' && (
          <div>
            {govtUpdates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <p style={{ fontSize: 16 }}>Government updates will appear here daily.</p>
                <p style={{ fontSize: 13, marginTop: 8 }}>Monitoring CBIC, CBDT, GST Portal, MCA21, RBI, and PIB Finance.</p>
              </div>
            ) : (
              govtUpdates.map(u => <GovtUpdateCard key={u.id} update={u} />)
            )}
          </div>
        )}

        {activeTab === 'video' && (
          <div>
            {videoUpdates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <p style={{ fontSize: 16 }}>CA video summaries will appear here daily.</p>
                <p style={{ fontSize: 13, marginTop: 8 }}>Monitoring top Indian CA YouTube channels for tax and accounting updates.</p>
              </div>
            ) : (
              videoUpdates.map(u => <VideoUpdateCard key={u.id} update={u} />)
            )}
          </div>
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
