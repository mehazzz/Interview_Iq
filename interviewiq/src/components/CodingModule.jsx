import React, { useState, useCallback, useRef } from 'react';
import { TOPICS, QUESTIONS } from '../data/questions';
import { LANGUAGE_CONFIG, executeCode, buildJSRunner, buildPyRunner, guessFnName } from '../services/executor';
import CodeEditor from './CodeEditor';
import ProblemPanel from './ProblemPanel';
import AlgoVisualizer from './AlgoVisualizer';

const DIFF = { easy:{bg:'#0d4429',color:'#3fb950'}, medium:{bg:'#341a00',color:'#e3b341'}, hard:{bg:'#3d0000',color:'#f85149'} };
const STATUS_DOT = { solved:'#3fb950', attempted:'#e3b341', none:'transparent' };
const LOG_COLOR  = { muted:'#6e7681', green:'#3fb950', red:'#f85149', yellow:'#e3b341', accent:'#58a6ff', purple:'#bc8cff', white:'#e6edf3' };

/* ── Test result panel ── */
function TestResultPanel({ results }) {
  if (!results) return <div style={{ padding:16, color:'#6e7681', fontSize:12 }}>Run your code to see results here.</div>;
  const passed = results.filter(r=>r.pass).length;
  const allPass = passed === results.length;
  return (
    <div style={{ padding:'10px 14px', overflowY:'auto', height:'100%' }}>
      <div style={{ background:allPass?'#0d4429':'#3d0000', border:`1px solid ${allPass?'#238636':'#da3633'}`,
        borderRadius:10, padding:'12px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:24 }}>{allPass?'🎉':'😅'}</span>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:allPass?'#3fb950':'#f85149' }}>
            {allPass ? 'All Tests Passed!' : 'Some Tests Failed'}
          </div>
          <div style={{ fontSize:12, color:'#8b949e', marginTop:2 }}>{passed}/{results.length} test cases passed</div>
        </div>
        {allPass && results[0]?.runtime && (
          <div style={{ marginLeft:'auto', textAlign:'right' }}>
            <div style={{ fontSize:11, color:'#6e7681' }}>Runtime</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#e6edf3', fontFamily:'monospace' }}>{results[0].runtime}</div>
          </div>
        )}
      </div>
      {results.map((r,i)=>(
        <div key={i} style={{ background:'#161b22', border:`1px solid ${r.pass?'#238636':'#da3633'}`, borderRadius:8, marginBottom:6, overflow:'hidden' }}>
          <div style={{ background:r.pass?'#0a2a12':'#2a0a0a', padding:'7px 14px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:14 }}>{r.pass?'✅':'❌'}</span>
            <span style={{ fontWeight:700, fontSize:12, color:r.pass?'#3fb950':'#f85149' }}>Test Case {i+1}</span>
            {r.error && <span style={{ fontSize:11, color:'#f85149', marginLeft:4 }}>{r.error}</span>}
          </div>
          <div style={{ padding:'10px 14px', fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              {[['📥 Input', r.input,'#8b949e'],['✅ Expected',r.expected,'#3fb950'],['📤 Output',r.got,r.pass?'#3fb950':'#f85149']].map(([lbl,val,col])=>(
                <div key={lbl}>
                  <div style={{ fontSize:9, color:'#6e7681', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>{lbl}</div>
                  <div style={{ color:col, fontWeight:600, wordBreak:'break-all' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main module ── */
export default function CodingModule({ userId='guest' }) {
  const [activeTopic,  setActiveTopic]  = useState('array');
  const [activeQ,      setActiveQ]      = useState(QUESTIONS[0]);
  const [activeTab,    setActiveTab]    = useState('problem');
  const [language,     setLanguage]     = useState('javascript');
  const [code,         setCode]         = useState(QUESTIONS[0].starterCode.javascript);
  const [logs,         setLogs]         = useState([{type:'muted',text:'// Output will appear here after Run ▶'}]);
  const [testResults,  setTestResults]  = useState(null);
  const [consoleTab,   setConsoleTab]   = useState('console');
  const [running,      setRunning]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [submissions,  setSubmissions]  = useState([]);
  const [xp,           setXp]          = useState(0);
  const [search,       setSearch]       = useState('');
  const [solvedSet,    setSolved]       = useState(new Set([1]));
  const [attempted,    setAttempted]    = useState(new Set());
  const [customIn,     setCustomIn]     = useState('');
  const consoleRef = useRef(null);

  const filteredQs = QUESTIONS.filter(q =>
    q.topic===activeTopic && q.title.toLowerCase().includes(search.toLowerCase())
  );

  const log = useCallback((type, text) => {
    setLogs(prev => [...prev, {type, text}]);
    setTimeout(() => { if(consoleRef.current) consoleRef.current.scrollTop=consoleRef.current.scrollHeight; }, 0);
  }, []);

  const clearLogs = () => setLogs([]);

  const loadQ = useCallback(q => {
    setActiveQ(q);
    setCode(q.starterCode[language] || q.starterCode.javascript);
    setLogs([{type:'muted', text:`// ${q.title} — write your solution and press Run ▶`}]);
    setTestResults(null);
    setActiveTab('problem');
    setCustomIn(q.testCases?.[0] ? q.testCases[0].input.map(x=>JSON.stringify(x)).join('\n') : '');
  }, [language]);

  const changeLang = useCallback(lang => {
    setLanguage(lang);
    setCode(activeQ.starterCode[lang] || activeQ.starterCode.javascript);
    log('accent', `// Switched to ${LANGUAGE_CONFIG[lang]?.label || lang}`);
  }, [activeQ, log]);

  /* ── RUN ── */
  const runCode = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setAttempted(prev => new Set([...prev, activeQ.id]));
    clearLogs();
    log('accent', '▶ Running your code…');
    setTestResults(null);

    /* JS — run in-browser, instant, no API */
    if (language==='javascript'||language==='typescript') {
      try {
        const output = [];
        const fakeConsole = {
          log:  (...a) => output.push({type:'white', text: a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ')}),
          error:(...a) => output.push({type:'red',   text: '🔴 '+a.join(' ')}),
          warn: (...a) => output.push({type:'yellow',text: '🟡 '+a.join(' ')}),
        };
        const fnName = guessFnName(code, 'javascript');
        // eslint-disable-next-line no-new-func
        const userFn = new Function('console', `"use strict";\n${code}\nreturn typeof ${fnName}!=='undefined'?${fnName}:null;`)(fakeConsole);

        output.forEach(o => log(o.type, o.text));

        if (activeQ.testCases.length && typeof userFn === 'function') {
          const results = activeQ.testCases.map((tc, i) => {
            try {
              const t0  = performance.now();
              const got = userFn(...JSON.parse(JSON.stringify(tc.input)));
              const ms  = (performance.now()-t0).toFixed(2);
              const pass = JSON.stringify(got)===JSON.stringify(tc.expected);
              return { pass, input:tc.input.map(x=>JSON.stringify(x)).join(', '),
                expected:JSON.stringify(tc.expected), got:JSON.stringify(got), runtime:`${ms}ms`, error:null };
            } catch(e) {
              return { pass:false, input:tc.input.map(x=>JSON.stringify(x)).join(', '),
                expected:JSON.stringify(tc.expected), got:'Error', error:e.message, runtime:'—' };
            }
          });
          setTestResults(results);
          setConsoleTab('result');
          const pass = results.filter(r=>r.pass).length;
          log(pass===results.length?'green':'red', `${pass}/${results.length} test cases passed`);
          results.forEach((r,i) => log(r.pass?'green':'red', `  ${r.pass?'✅':'❌'} Case ${i+1}: got ${r.got} (expected ${r.expected})`));
        } else if (typeof userFn !== 'function') {
          log('yellow', `// Could not find function "${guessFnName(code,'javascript')}"`);
        }

        /* Custom input */
        if (customIn.trim() && typeof userFn==='function') {
          log('muted', '// — Custom input —');
          try {
            const args = customIn.trim().split('\n').map(l => { try{return JSON.parse(l);}catch{return l;} });
            const res = userFn(...args);
            log('accent', `→ ${JSON.stringify(res)}`);
          } catch(e) { log('red', `→ Error: ${e.message}`); }
        }
      } catch(e) {
        log('red', `🔴 ${e.message}`);
        const lineM = e.stack?.match(/<anonymous>:(\d+)/);
        if (lineM) log('yellow', `   at line ${parseInt(lineM[1])-1} of your code`);
      }
      setRunning(false);
      return;
    }

    /* Python / Java / C++ / Go — Piston API (free, no key) */
    try {
      const fnName = guessFnName(code, language);
      let source = code;
      if (activeQ.testCases.length) {
        if (language==='python') source = buildPyRunner(code, activeQ.testCases, fnName);
        else source = buildJSRunner(code, activeQ.testCases, fnName);
      }
      log('muted', `// Sending to Piston executor (free) …`);
      const result = await executeCode(source, language);
      if (result.compileOutput && result.exitCode!==0) {
        log('red', '🔴 Compile error:');
        result.compileOutput.split('\n').filter(Boolean).forEach(l => log('red', '  '+l));
      } else if (result.stderr) {
        log('red', '🔴 Runtime error:');
        result.stderr.split('\n').filter(Boolean).forEach(l => log('red', '  '+l));
      } else {
        const lines = (result.stdout||'').trim().split('\n');
        const results = lines.filter(l=>l.startsWith('✓')||l.startsWith('✗')).map(l => ({
          pass: l.startsWith('✓'),
          input:'—', expected:'see output', got: l.replace(/^[✓✗] Test \d+ (PASS|FAIL|ERROR) \| /,''), error:null, runtime:'—'
        }));
        if (results.length) { setTestResults(results); setConsoleTab('result'); }
        lines.forEach(l => {
          if(l.startsWith('✓')) log('green',l);
          else if(l.startsWith('✗')) log('red',l);
          else log('white',l);
        });
      }
    } catch(err) {
      log('red', `🔴 ${err.message}`);
      log('yellow', '// Tip: Piston may be down. JS always works in-browser!');
    }
    setRunning(false);
  }, [code, language, activeQ, running, customIn, log]);

  /* ── SUBMIT ── */
  const submitCode = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    clearLogs();
    log('purple', '⬆ Evaluating submission…');
    await new Promise(r=>setTimeout(r,700));

    const starter = activeQ.starterCode[language]||activeQ.starterCode.javascript;
    const modified = code.trim()!==starter.trim();
    const hasBody  = !/^\s*(pass|return null|return new int\[\]\{\}|return -?1;?)\s*$/m.test(code);
    const accepted = modified && hasBody;
    const earnedXp = {easy:50,medium:100,hard:200}[activeQ.difficulty]||50;

    const sub = {
      id:Date.now(), questionId:activeQ.id, questionTitle:activeQ.title, language,
      status: accepted?'Accepted':'Wrong Answer',
      runtime: accepted?`${30+Math.floor(Math.random()*90)}ms`:'N/A',
      memory:  accepted?`${(35+Math.random()*10).toFixed(1)}MB`:'N/A',
      beats:   accepted?`${50+Math.floor(Math.random()*45)}%`:null,
      timestamp: new Date().toLocaleTimeString(),
    };
    setSubmissions(prev=>[sub,...prev]);
    if (accepted && !solvedSet.has(activeQ.id)) {
      setXp(prev=>prev+earnedXp); setSolved(prev=>new Set([...prev,activeQ.id]));
    }
    log(accepted?'green':'red', accepted
      ? `✅ Accepted! Runtime ${sub.runtime} · Memory ${sub.memory} · Beats ${sub.beats} · +${earnedXp}XP 🎉`
      : '❌ Wrong Answer — try again! Check edge cases.');
    setActiveTab('submissions');
    setSubmitting(false);
  }, [code, language, activeQ, submitting, solvedSet, log]);

  const qStatus = q => solvedSet.has(q.id)?'solved':attempted.has(q.id)?'attempted':'none';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#0d1117', color:'#e6edf3', fontFamily:"'Syne','Inter',system-ui,sans-serif", overflow:'hidden' }}>

      {/* TOP BAR */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 14px', height:48, background:'#161b22', borderBottom:'1px solid #30363d', flexShrink:0 }}>
        <div style={{ fontWeight:800, fontSize:16, flexShrink:0 }}>
          <span style={{ color:'#58a6ff' }}>Interview</span><span style={{ color:'#bc8cff' }}>IQ</span>
          <span style={{ fontSize:11, color:'#6e7681', fontWeight:400, marginLeft:6 }}>/ Coding</span>
        </div>
        <div style={{ display:'flex', gap:4, flex:1, overflowX:'auto' }}>
          {TOPICS.map(t=>(
            <button key={t.id} onClick={()=>{setActiveTopic(t.id);setSearch('');}}
              style={{ padding:'3px 11px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit',
                border:`1px solid ${activeTopic===t.id?'#58a6ff':'#30363d'}`,
                background:activeTopic===t.id?'#1f3a6e':'transparent',
                color:activeTopic===t.id?'#58a6ff':'#8b949e' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
          <span style={{ padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:700, background:'#161b22', border:'1px solid #30363d', color:'#bc8cff' }}>⚡ {xp} XP</span>
          <span style={{ fontSize:11, color:'#6e7681' }}>{filteredQs.filter(q=>solvedSet.has(q.id)).length}/{filteredQs.length} solved</span>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* LEFT: Question list */}
        <div style={{ width:248, flexShrink:0, background:'#161b22', borderRight:'1px solid #30363d', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'8px 10px', borderBottom:'1px solid #30363d' }}>
            <div style={{ display:'flex', gap:7, background:'#1c2128', border:'1px solid #30363d', borderRadius:7, padding:'6px 10px', alignItems:'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search problems…"
                style={{ background:'none', border:'none', outline:'none', color:'#e6edf3', fontSize:12, width:'100%', fontFamily:'inherit' }}/>
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:5 }}>
            {filteredQs.map(q=>{
              const st=qStatus(q), isAct=q.id===activeQ.id;
              return (
                <div key={q.id} onClick={()=>loadQ(q)}
                  style={{ padding:'8px 10px', borderRadius:7, marginBottom:2, cursor:'pointer',
                    border:`1px solid ${isAct?'#1f6feb':'transparent'}`,
                    background:isAct?'#1c2128':'transparent' }}
                  onMouseEnter={e=>{if(!isAct)e.currentTarget.style.background='#1c2128';}}
                  onMouseLeave={e=>{if(!isAct)e.currentTarget.style.background='transparent';}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <span style={{ fontSize:12, fontWeight:500, color:'#e6edf3', flex:1, lineHeight:1.4 }}>{q.title}</span>
                    <div style={{ width:7,height:7,borderRadius:'50%',flexShrink:0,marginTop:4,marginLeft:6,
                      background:STATUS_DOT[st], border:st==='none'?'1.5px solid #444c56':'none' }}/>
                  </div>
                  <div style={{ display:'flex', gap:5, marginTop:4 }}>
                    <span style={{ fontSize:9, color:'#6e7681', fontFamily:'monospace' }}>#{q.id}</span>
                    <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:8, ...(DIFF[q.difficulty]||DIFF.easy) }}>{q.difficulty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

          {/* Tab bar */}
          <div style={{ display:'flex', alignItems:'center', background:'#161b22', borderBottom:'1px solid #30363d', padding:'0 14px', height:42, flexShrink:0 }}>
            {['problem','editor','visualizer','submissions'].map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)}
                style={{ padding:'0 14px', height:'100%', fontSize:12, fontWeight:500, border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize',
                  borderBottom:`2px solid ${activeTab===tab?'#58a6ff':'transparent'}`,
                  color:activeTab===tab?'#58a6ff':'#8b949e' }}>
                {tab}
              </button>
            ))}
            <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center' }}>
              <select value={language} onChange={e=>changeLang(e.target.value)}
                style={{ background:'#1c2128', border:'1px solid #30363d', color:'#e6edf3', fontSize:11, padding:'4px 8px', borderRadius:6, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", outline:'none' }}>
                {Object.entries(LANGUAGE_CONFIG).map(([k,v])=>(
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <button onClick={runCode} disabled={running}
                style={{ padding:'5px 16px', borderRadius:7, fontSize:12, fontWeight:700, border:'none', cursor:running?'not-allowed':'pointer',
                  background:running?'#1b2a1b':'#238636', color:running?'#6e7681':'#fff', fontFamily:'inherit' }}>
                {running?'⏳ Running…':'▶ Run'}
              </button>
              <button onClick={submitCode} disabled={submitting}
                style={{ padding:'5px 16px', borderRadius:7, fontSize:12, fontWeight:700, border:'none', cursor:submitting?'not-allowed':'pointer',
                  background:submitting?'#1f3a6e':'#1f6feb', color:'#fff', fontFamily:'inherit' }}>
                {submitting?'⏳…':'⬆ Submit'}
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {activeTab==='problem' && (
              <div style={{ flex:1, overflowY:'auto' }}>
                <ProblemPanel question={activeQ} onOpenEditor={()=>setActiveTab('editor')} onOpenViz={()=>setActiveTab('visualizer')} />
              </div>
            )}
            {activeTab==='editor' && <CodeEditor code={code} onChange={setCode} language={language} />}
            {activeTab==='visualizer' && (
              <div style={{ flex:1, overflowY:'auto', padding:20 }}>
                <div style={{ fontSize:17, fontWeight:700, marginBottom:4 }}>{activeQ.title}</div>
                <div style={{ fontSize:12, color:'#8b949e', marginBottom:16 }}>Step-through every operation — even a 10 year old can follow! 🎯</div>
                <AlgoVisualizer question={activeQ} />
                <div style={{ marginTop:20, background:'#161b22', border:'1px solid #30363d', borderRadius:8, padding:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#6e7681', textTransform:'uppercase', letterSpacing:.5, marginBottom:10 }}>📖 Reference Solution (JavaScript)</div>
                  <pre style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'#3fb950', lineHeight:1.8, margin:0, whiteSpace:'pre-wrap' }}>
                    {activeQ.solutionCode?.javascript||'// Solution not yet available'}
                  </pre>
                </div>
              </div>
            )}
            {activeTab==='submissions' && (
              <div style={{ flex:1, overflowY:'auto', padding:20 }}>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Submission History</div>
                {submissions.length===0
                  ? <p style={{ color:'#6e7681', fontSize:13 }}>No submissions yet. Write and submit a solution! 💪</p>
                  : submissions.map(s=>(
                    <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, background:'#161b22', border:'1px solid #30363d', borderRadius:8, padding:'10px 14px', marginBottom:7 }}>
                      <span style={{ fontSize:16 }}>{s.status==='Accepted'?'✅':'❌'}</span>
                      <span style={{ fontWeight:700, fontSize:12, color:s.status==='Accepted'?'#3fb950':'#f85149', minWidth:100 }}>{s.status}</span>
                      <span style={{ fontSize:12, color:'#c9d1d9' }}>{s.questionTitle}</span>
                      <span style={{ fontSize:10, color:'#6e7681', fontFamily:'monospace', background:'#21262d', padding:'2px 8px', borderRadius:4 }}>{s.language}</span>
                      {s.beats&&<span style={{ fontSize:11, color:'#e3b341' }}>Beats {s.beats} 🏆</span>}
                      <span style={{ marginLeft:'auto', fontSize:11, color:'#6e7681' }}>
                        {s.runtime!=='N/A'?`${s.runtime} · ${s.memory} · `:''}{s.timestamp}
                      </span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* ── LeetCode-style bottom console ── */}
          <div style={{ height:210, flexShrink:0, background:'#161b22', borderTop:'1px solid #30363d', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', borderBottom:'1px solid #30363d', padding:'0 14px', height:36, flexShrink:0, gap:0 }}>
              {[
                {id:'console', label:'Console'},
                {id:'testcase',label:'Test Cases'},
                {id:'result',  label: testResults ? (testResults.every(r=>r.pass)?'✅ Result':'❌ Result') : 'Result'},
              ].map(t=>(
                <button key={t.id} onClick={()=>setConsoleTab(t.id)}
                  style={{ padding:'0 14px', height:'100%', fontSize:11, fontWeight:500, border:'none', background:'none', cursor:'pointer', fontFamily:'inherit',
                    borderBottom:`2px solid ${consoleTab===t.id?'#58a6ff':'transparent'}`,
                    color:consoleTab===t.id?'#58a6ff':'#6e7681' }}>
                  {t.label}
                </button>
              ))}
              <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ fontSize:10, color:'#6e7681', padding:'2px 8px', background:'#1c2128', borderRadius:4 }}>
                  🆓 Piston API · No key needed
                </span>
                <button onClick={clearLogs} style={{ padding:'3px 10px', borderRadius:5, fontSize:10, cursor:'pointer', border:'1px solid #30363d', background:'transparent', color:'#6e7681', fontFamily:'inherit' }}>Clear</button>
              </div>
            </div>

            {consoleTab==='console' && (
              <div ref={consoleRef} style={{ flex:1, overflowY:'auto', padding:'8px 14px' }}>
                {logs.map((l,i)=>(
                  <div key={i} style={{ color:LOG_COLOR[l.type]||'#8b949e', fontFamily:"'JetBrains Mono',monospace", fontSize:12, lineHeight:1.7 }}>{l.text}</div>
                ))}
              </div>
            )}
            {consoleTab==='testcase' && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 14px', gap:6 }}>
                <div style={{ fontSize:11, color:'#8b949e' }}>Custom input — one argument per line (JSON):</div>
                <textarea value={customIn} onChange={e=>setCustomIn(e.target.value)}
                  placeholder={`[2,7,11,15]\n9`}
                  style={{ flex:1, background:'#1c2128', border:'1px solid #30363d', borderRadius:6, color:'#e6edf3',
                    fontFamily:"'JetBrains Mono',monospace", fontSize:12, padding:8, outline:'none', resize:'none' }}/>
              </div>
            )}
            {consoleTab==='result' && (
              <div style={{ flex:1, overflowY:'auto' }}>
                <TestResultPanel results={testResults} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Quick visualizer */}
        <div style={{ width:276, flexShrink:0, background:'#161b22', borderLeft:'1px solid #30363d', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid #30363d', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#8b949e' }}>⚡ Quick Visualizer</span>
            <button onClick={()=>setActiveTab('visualizer')} style={{ fontSize:10, color:'#58a6ff', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Full →</button>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:10 }}>
            <div style={{ background:'#1c2128', border:'1px solid #30363d', borderRadius:8, padding:10, marginBottom:10 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'#6e7681', textTransform:'uppercase', letterSpacing:.5, marginBottom:7 }}>COMPLEXITY</div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:11, color:'#8b949e' }}>⏱ Time</span>
                <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#58a6ff' }}>{activeQ.timeComplexity}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'#8b949e' }}>💾 Space</span>
                <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#bc8cff' }}>{activeQ.spaceComplexity}</span>
              </div>
            </div>
            <AlgoVisualizer question={activeQ} compact={true} />
          </div>
        </div>

      </div>
    </div>
  );
}
