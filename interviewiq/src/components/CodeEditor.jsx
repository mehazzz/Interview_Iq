import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useLinter } from '../hooks/useLinter';

const SEV = {
  error: { color:'#f85149', bg:'#3d0000', border:'#da3633', icon:'✕', gutter:'🔴' },
  warn:  { color:'#e3b341', bg:'#341a00', border:'#e3b341', icon:'⚠', gutter:'🟡' },
  info:  { color:'#58a6ff', bg:'#0d2149', border:'#1f6feb', icon:'ℹ', gutter:'🔵' },
};

export default function CodeEditor({ code, onChange, language }) {
  const taRef      = useRef(null);
  const numsRef    = useRef(null);
  const lints      = useLinter(code, language);
  const [hoveredLint, setHoveredLint] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const syncScroll = useCallback(() => {
    if (numsRef.current && taRef.current)
      numsRef.current.scrollTop = taRef.current.scrollTop;
  }, []);

  const handleKeyDown = useCallback(e => {
    const ta = e.target;
    const s = ta.selectionStart, end = ta.selectionEnd;

    if (e.key === 'Tab') {
      e.preventDefault();
      const next = ta.value.slice(0,s) + '    ' + ta.value.slice(end);
      onChange(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s+4; });
      return;
    }
    // Auto-close pairs
    const PAIRS = { '(':')', '[':']', '{':'}', '"':'"', "'":"'", '`':'`' };
    if (PAIRS[e.key] && e.key !== '"' && e.key !== "'" && e.key !== '`') {
      e.preventDefault();
      const next = ta.value.slice(0,s) + e.key + PAIRS[e.key] + ta.value.slice(end);
      onChange(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s+1; });
      return;
    }
    // Auto-indent after {
    if (e.key === 'Enter') {
      const lineStart = ta.value.lastIndexOf('\n', s-1)+1;
      const currentLine = ta.value.slice(lineStart, s);
      const indent = currentLine.match(/^(\s*)/)[1];
      const extraIndent = currentLine.trimEnd().endsWith('{') ? '    ' : '';
      e.preventDefault();
      const next = ta.value.slice(0,s) + '\n' + indent + extraIndent + ta.value.slice(end);
      onChange(next);
      const newPos = s + 1 + indent.length + extraIndent.length;
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; });
    }
  }, [onChange]);

  const lineCount = (code||'').split('\n').length;
  const errorLineSet = new Map(); // line → worst severity
  lints.forEach(l => {
    const existing = errorLineSet.get(l.line);
    const priority = {error:3,warn:2,info:1};
    if (!existing || priority[l.sev] > priority[existing]) errorLineSet.set(l.line, l.sev);
  });

  const errorCount  = lints.filter(l=>l.sev==='error').length;
  const warnCount   = lints.filter(l=>l.sev==='warn').length;
  const infoCount   = lints.filter(l=>l.sev==='info').length;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0, background:'#0d1117', fontFamily:"'JetBrains Mono','Fira Code',monospace" }}>

      {/* Status bar at top of editor */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'4px 12px', background:'#161b22', borderBottom:'1px solid #21262d', flexShrink:0 }}>
        <span style={{ fontSize:10, color:'#6e7681' }}>{language.toUpperCase()}</span>
        {errorCount>0  && <span style={{ fontSize:10, color:'#f85149', display:'flex', alignItems:'center', gap:4 }}>🔴 {errorCount} error{errorCount>1?'s':''}</span>}
        {warnCount>0   && <span style={{ fontSize:10, color:'#e3b341', display:'flex', alignItems:'center', gap:4 }}>🟡 {warnCount} warning{warnCount>1?'s':''}</span>}
        {infoCount>0   && <span style={{ fontSize:10, color:'#58a6ff', display:'flex', alignItems:'center', gap:4 }}>🔵 {infoCount} hint{infoCount>1?'s':''}</span>}
        {lints.length===0 && <span style={{ fontSize:10, color:'#3fb950' }}>✓ No issues</span>}
        <span style={{ marginLeft:'auto', fontSize:10, color:'#6e7681' }}>{lineCount} lines · {(code||'').length} chars</span>
      </div>

      {/* Editor body */}
      <div style={{ flex:1, display:'flex', minHeight:0, position:'relative' }}>
        {/* Gutter */}
        <div ref={numsRef} style={{
          width:56, flexShrink:0, padding:'14px 0 14px 0',
          background:'#0d1117', borderRight:'1px solid #21262d',
          overflowY:'hidden', userSelect:'none',
          display:'flex', flexDirection:'column',
        }}>
          {Array.from({length:lineCount},(_,i)=>i+1).map(ln => {
            const sev = errorLineSet.get(ln);
            const s = sev ? SEV[sev] : null;
            return (
              <div key={ln}
                style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:6, height:'1.6em',
                  cursor: s ? 'pointer' : 'default',
                }}
                onMouseEnter={() => {
                  if (s) {
                    const lineLints = lints.filter(l=>l.line===ln);
                    setTooltip({ ln, lints:lineLints });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {s
                  ? <span style={{ fontSize:10 }}>{s.gutter}</span>
                  : <span style={{ fontSize:11, color:'#444c56' }}>{ln}</span>
                }
              </div>
            );
          })}
        </div>

        {/* Textarea */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          {/* Error underline overlay — draw colored bg on error lines */}
          <div style={{ position:'absolute', top:0, left:0, right:0, pointerEvents:'none', padding:'14px 0', zIndex:1 }}>
            {lints.map((l,i) => {
              const s = SEV[l.sev];
              return (
                <div key={i} style={{
                  position:'absolute',
                  top: `calc(14px + ${(l.line-1)*1.6}em)`,
                  left:0, right:0, height:'1.6em',
                  background: s.bg+'33',
                  borderLeft:`3px solid ${s.border}`,
                  pointerEvents:'none',
                }}/>
              );
            })}
          </div>

          <textarea
            ref={taRef}
            value={code}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            style={{
              position:'relative', zIndex:2,
              width:'100%', height:'100%',
              padding:'14px 16px',
              background:'transparent',
              border:'none', outline:'none', resize:'none',
              color:'#e6edf3', fontSize:13, lineHeight:'1.6',
              fontFamily:'inherit', tabSize:4,
              overflowY:'auto', whiteSpace:'pre',
            }}
          />
        </div>

        {/* Tooltip on gutter hover */}
        {tooltip && (
          <div style={{
            position:'absolute', left:60, top:`calc(14px + ${(tooltip.ln-1)*1.6}em)`,
            background:'#1c2128', border:'1px solid #30363d', borderRadius:8,
            padding:'10px 14px', zIndex:100, maxWidth:340, boxShadow:'0 8px 24px #0008',
          }}>
            {tooltip.lints.map((l,i) => {
              const s = SEV[l.sev];
              return (
                <div key={i} style={{ marginBottom: i<tooltip.lints.length-1?8:0 }}>
                  <div style={{ display:'flex', gap:6, alignItems:'flex-start', marginBottom:3 }}>
                    <span style={{ color:s.color, fontSize:11, fontWeight:700 }}>{s.icon} {l.sev.toUpperCase()}</span>
                    <span style={{ fontSize:10, color:'#6e7681' }}>line {l.line}</span>
                  </div>
                  <div style={{ fontSize:12, color:'#c9d1d9', lineHeight:1.5, marginBottom:4 }}>{l.msg}</div>
                  {l.fix && <div style={{ fontSize:11, color:'#3fb950', background:'#0d4429', padding:'3px 8px', borderRadius:4 }}>💡 {l.fix}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom lint panel — scrollable list of all issues */}
      {lints.length > 0 && (
        <div style={{
          background:'#161b22', borderTop:'1px solid #30363d',
          maxHeight:130, overflowY:'auto', flexShrink:0,
        }}>
          {lints.map((l, i) => {
            const s = SEV[l.sev];
            return (
              <div key={i} onClick={() => {
                  // Jump to line in textarea
                  if (!taRef.current) return;
                  const lines = code.split('\n');
                  const pos = lines.slice(0,l.line-1).join('\n').length + (l.line>1?1:0);
                  taRef.current.focus();
                  taRef.current.setSelectionRange(pos, pos + lines[l.line-1]?.length || 0);
                }}
                style={{
                  display:'flex', alignItems:'flex-start', gap:10, padding:'6px 14px',
                  borderBottom:'1px solid #21262d', cursor:'pointer',
                  transition:'background .1s',
                }}
                onMouseEnter={e=>e.currentTarget.style.background='#1c2128'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <div style={{ width:16,height:16,borderRadius:'50%',background:s.bg,border:`1px solid ${s.border}`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:s.color,flexShrink:0,marginTop:1,fontWeight:700 }}>
                  {s.icon}
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, color:'#c9d1d9' }}>{l.msg}</span>
                  {l.fix && <span style={{ fontSize:11, color:'#3fb950', marginLeft:8 }}>→ {l.fix}</span>}
                </div>
                <span style={{ fontSize:10, color:'#6e7681', fontFamily:'monospace', flexShrink:0 }}>Ln {l.line}{l.col?`, Col ${l.col}`:''}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
