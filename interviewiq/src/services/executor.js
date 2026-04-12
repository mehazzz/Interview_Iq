/**
 * Piston API — 100% FREE, no API key, no signup
 * https://github.com/engineer-man/piston
 * Supports: JavaScript, Python, Java, C++, Go, TypeScript, Rust, etc.
 */

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

// Piston language identifiers
export const LANGUAGE_CONFIG = {
  javascript: { pistonLang: 'javascript', pistonVer: '18.15.0', ext: 'js',   label: 'JavaScript' },
  python:     { pistonLang: 'python',     pistonVer: '3.10.0',  ext: 'py',   label: 'Python'     },
  java:       { pistonLang: 'java',       pistonVer: '15.0.2',  ext: 'java', label: 'Java'       },
  cpp:        { pistonLang: 'c++',        pistonVer: '10.2.0',  ext: 'cpp',  label: 'C++'        },
  typescript: { pistonLang: 'typescript', pistonVer: '5.0.3',   ext: 'ts',   label: 'TypeScript' },
  go:         { pistonLang: 'go',         pistonVer: '1.16.2',  ext: 'go',   label: 'Go'         },
};

/**
 * Execute code via Piston — completely free, no key needed.
 * @param {string} sourceCode
 * @param {string} language — key from LANGUAGE_CONFIG
 * @param {string} stdin
 */
export async function executeCode(sourceCode, language, stdin = '') {
  const cfg = LANGUAGE_CONFIG[language];
  if (!cfg) throw new Error(`Unsupported language: ${language}`);

  const res = await fetch(PISTON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: cfg.pistonLang,
      version:  cfg.pistonVer,
      files: [{ name: `solution.${cfg.ext}`, content: sourceCode }],
      stdin,
      run_timeout: 5000,
      compile_timeout: 10000,
    }),
  });

  if (!res.ok) throw new Error(`Piston error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const run  = data.run || {};
  const comp = data.compile || {};

  return {
    stdout:        run.stdout  || '',
    stderr:        run.stderr  || comp.stderr || '',
    compileOutput: comp.stdout || comp.stderr || '',
    exitCode:      run.code ?? 0,
    accepted:      (run.code === 0) && !run.stderr,
    signal:        run.signal,
  };
}

/** Build JS test harness that prints pass/fail per case */
export function buildJSRunner(userCode, testCases, fnName) {
  const harness = testCases.map((tc, i) => {
    const args = tc.input.map(a => JSON.stringify(a)).join(', ');
    return `
(function(){
  try {
    const inp = [${tc.input.map(a=>JSON.stringify(a)).join(',')}];
    const result = ${fnName}(${args});
    const expected = ${JSON.stringify(tc.expected)};
    const ok = JSON.stringify(result) === JSON.stringify(expected);
    console.log(ok
      ? '✓ Test ${i+1} PASS | output: ' + JSON.stringify(result)
      : '✗ Test ${i+1} FAIL | got: ' + JSON.stringify(result) + ' | expected: ' + JSON.stringify(expected));
  } catch(e) {
    console.log('✗ Test ${i+1} ERROR | ' + e.message);
  }
})();`;
  }).join('\n');
  return `${userCode}\n\n${harness}`;
}

/** Build Python test harness */
export function buildPyRunner(userCode, testCases, methodName) {
  const harness = testCases.map((tc, i) => {
    const args = tc.input.map(a => JSON.stringify(a)).join(', ');
    return `
try:
    _res = Solution().${methodName}(${args})
    _exp = ${JSON.stringify(tc.expected)}
    if str(_res) == str(_exp) or _res == _exp:
        print(f'✓ Test ${i+1} PASS | output: {_res}')
    else:
        print(f'✗ Test ${i+1} FAIL | got: {_res} | expected: {_exp}')
except Exception as _e:
    print(f'✗ Test ${i+1} ERROR | {_e}')`;
  }).join('\n');
  return `${userCode}\n\n${harness}`;
}

/** Build Java test harness */
export function buildJavaRunner(userCode, testCases) {
  // Wrap in a runnable main
  return userCode; // Java needs custom per-problem setup
}

/** Guess the top-level function/method name */
export function guessFnName(code, lang) {
  if (lang === 'javascript' || lang === 'typescript') {
    const m = code.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:function|\())/);
    return m ? (m[1] || m[2]) : 'solution';
  }
  if (lang === 'python') {
    const matches = [...code.matchAll(/def\s+(\w+)\s*\(/g)].map(m => m[1]).filter(n => !n.startsWith('_'));
    return matches[0] || 'solution';
  }
  return 'solution';
}
