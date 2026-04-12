import React, { useState } from 'react';

const DIFF_STYLE = {
  easy:   { bg: '#0d4429', color: '#3fb950', label: 'Easy' },
  medium: { bg: '#341a00', color: '#e3b341', label: 'Medium' },
  hard:   { bg: '#3d0000', color: '#f85149', label: 'Hard' },
};

function HintCard({ index, text }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
        padding: '10px 14px', marginBottom: 8, cursor: 'pointer',
        transition: 'border-color .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#444c56'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#8b949e' }}>Hint {index + 1}</span>
        <span style={{ color: '#6e7681', fontSize: 11, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
      </div>
      {open && (
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#8b949e', lineHeight: 1.6 }}>{text}</p>
      )}
    </div>
  );
}

export default function ProblemPanel({ question, onOpenEditor, onOpenViz }) {
  if (!question) return null;
  const diff = DIFF_STYLE[question.difficulty] || DIFF_STYLE.easy;

  return (
    <div style={{ padding: '20px 24px', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3' }}>
          {question.id}. {question.title}
        </span>
        <span style={{
          padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
          background: diff.bg, color: diff.color,
        }}>{diff.label}</span>
      </div>

      {/* Topics tags */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={tagStyle}>{question.topic}</span>
        <span style={{ ...tagStyle, background: '#161b22', color: '#8b949e' }}>
          Time: <span style={{ color: '#58a6ff' }}>{question.timeComplexity}</span>
        </span>
        <span style={{ ...tagStyle, background: '#161b22', color: '#8b949e' }}>
          Space: <span style={{ color: '#bc8cff' }}>{question.spaceComplexity}</span>
        </span>
      </div>

      {/* Description */}
      <p
        style={{ fontSize: 14, color: '#c9d1d9', lineHeight: 1.8, marginBottom: 20 }}
        dangerouslySetInnerHTML={{ __html: question.desc.replace(/<code>/g, '<code style="color:#58a6ff;background:#1c2128;padding:1px 6px;border-radius:4px;font-family:monospace">').replace(/<strong>/g, '<strong style="color:#e6edf3">') }}
      />

      {/* Examples */}
      {question.examples.map((ex, i) => (
        <div key={i} style={{
          background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
          padding: '12px 16px', marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
            Example {i + 1}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#6e7681' }}>Input: </span>
            <span style={{ color: '#e6edf3' }}>{ex.input}</span>
          </div>
          <div style={{ marginBottom: ex.explain ? 4 : 0 }}>
            <span style={{ color: '#6e7681' }}>Output: </span>
            <span style={{ color: '#3fb950' }}>{ex.output}</span>
          </div>
          {ex.explain && (
            <div style={{ marginTop: 4, color: '#8b949e', fontSize: 12 }}>
              Explanation: {ex.explain}
            </div>
          )}
        </div>
      ))}

      {/* Constraints */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Constraints</div>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {question.constraints.map((c, i) => (
            <li key={i} style={{ fontSize: 13, fontFamily: 'monospace', color: '#8b949e', marginBottom: 4 }}>{c}</li>
          ))}
        </ul>
      </div>

      {/* Hints */}
      {question.hints?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Hints</div>
          {question.hints.map((h, i) => <HintCard key={i} index={i} text={h} />)}
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onOpenEditor} style={ctaStyle('#1f6feb', '#58a6ff')}>Open Editor →</button>
        <button onClick={onOpenViz} style={ctaStyle('#1b2a1b', '#3fb950')}>Visualize Algorithm →</button>
      </div>
    </div>
  );
}

const tagStyle = {
  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  background: '#1c2128', color: '#58a6ff', border: '1px solid #30363d',
};

const ctaStyle = (bg, color) => ({
  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', border: 'none', background: bg, color,
  transition: 'opacity .15s', fontFamily: 'inherit',
});
