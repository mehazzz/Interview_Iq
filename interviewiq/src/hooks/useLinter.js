import { useMemo } from 'react';

/* ─── Rules per language ─────────────────────────────────────────────────── */
const JS_RULES = [
  { re: /\bvar\s+/,              msg: "Use 'let' or 'const' instead of 'var'",        sev:'warn',  fix:"Replace var with let/const" },
  { re: /[^=!<>]==(?!=)/,        msg: "Use '===' (strict equality) instead of '=='",  sev:'warn',  fix:"Replace == with ===" },
  { re: /[^=!<>]!=(?!=)/,        msg: "Use '!==' (strict) instead of '!='",           sev:'warn',  fix:"Replace != with !==" },
  { re: /\beval\s*\(/,           msg: "eval() is dangerous — never use it",            sev:'error', fix:"Remove eval()" },
  { re: /\bdocument\b/,          msg: "DOM access not allowed in algorithm problems",  sev:'error', fix:"Remove DOM code" },
  { re: /\bdebugger\b/,          msg: "debugger statement found — remove before submit",sev:'warn', fix:"Remove debugger" },
  { re: /\/\/\s*TODO/i,          msg: "TODO found — complete this before submitting",  sev:'info',  fix:"Implement TODO" },
  { re: /console\.log\s*\(\s*\)/,msg: "Empty console.log() does nothing",             sev:'info',  fix:"Remove or fill console.log" },
  { re: /while\s*\(\s*true\s*\)/,msg: "Infinite loop detected! Add a break condition",sev:'error', fix:"Add break condition" },
  { re: /\.innerHTML\s*=/,       msg: "innerHTML is a security risk",                 sev:'warn',  fix:"Use textContent instead" },
];

const PY_RULES = [
  { re: /\beval\s*\(/,           msg: "eval() is dangerous",                           sev:'error', fix:"Remove eval()" },
  { re: /\bexec\s*\(/,           msg: "exec() is dangerous",                           sev:'error', fix:"Remove exec()" },
  { re: /except\s*:/,            msg: "Bare except catches everything — be specific",  sev:'warn',  fix:"Use except Exception as e:" },
  { re: /\bpass\s*$/,            msg: "Unimplemented block (pass) — write your code!", sev:'info',  fix:"Implement this block" },
  { re: /import\s+os\b/,         msg: "OS module not needed for algorithm problems",   sev:'warn',  fix:"Remove import os" },
  { re: /while\s+True:/,         msg: "Infinite loop — make sure you have a break!",  sev:'warn',  fix:"Add break condition" },
];

const JAVA_RULES = [
  { re: /catch\s*\(\s*Exception\b/, msg: "Too broad — catch specific exceptions",     sev:'warn',  fix:"Catch a specific exception type" },
  { re: /\.equals\s*\(\s*null\s*\)/,msg: "Use == null instead of .equals(null)",      sev:'warn',  fix:"Replace with == null" },
  { re: /System\.exit\s*\(/,        msg: "System.exit() will kill the judge",          sev:'error', fix:"Remove System.exit()" },
  { re: /while\s*\(\s*true\s*\)/,   msg: "Infinite loop — add a break condition",     sev:'error', fix:"Add break condition" },
];

const CPP_RULES = [
  { re: /using namespace std;/,  msg: "'using namespace std' pollutes global namespace",sev:'info', fix:"Use std:: prefix instead" },
  { re: /\bgets\s*\(/,           msg: "gets() is unsafe — buffer overflow risk!",      sev:'error', fix:"Use fgets() instead" },
  { re: /\bscanf\s*\(/,          msg: "scanf without bounds can overflow",             sev:'warn',  fix:"Add width specifier e.g. %10s" },
  { re: /while\s*\(\s*1\s*\)/,   msg: "Infinite loop — add a break condition",        sev:'error', fix:"Add break condition" },
  { re: /\bsystem\s*\(/,         msg: "system() calls are not allowed",               sev:'error', fix:"Remove system() call" },
];

const RULES = { javascript:JS_RULES, typescript:JS_RULES, python:PY_RULES, java:JAVA_RULES, cpp:CPP_RULES };

/* ─── Bracket/paren structural check ────────────────────────────────────── */
function structuralCheck(code, lang) {
  if (lang === 'python') return [];
  const errs = [];
  const pairs = { '{':'}', '(':')','[':']' };
  const open  = new Set(Object.keys(pairs));
  const close = new Set(Object.values(pairs));
  const stack = [];
  let inStr = false, strCh = '', i = 0;

  while (i < code.length) {
    const c = code[i];
    // Track strings so we don't lint inside them
    if (!inStr && (c==='"'||c==="'"||c==='`')) { inStr=true; strCh=c; }
    else if (inStr && c===strCh && code[i-1]!=='\\') inStr=false;
    else if (!inStr) {
      const lineNum = code.slice(0,i).split('\n').length;
      if (open.has(c))  stack.push({ ch:c, line:lineNum });
      else if (close.has(c)) {
        if (!stack.length || pairs[stack[stack.length-1].ch] !== c) {
          errs.push({ line:lineNum, msg:`Unexpected closing '${c}' — check your brackets`, sev:'error', fix:`Remove or balance '${c}'` });
        } else stack.pop();
      }
    }
    i++;
  }
  stack.forEach(({ch, line}) =>
    errs.push({ line, msg:`Unclosed '${ch}' — you opened it but never closed it`, sev:'error', fix:`Add closing '${pairs[ch]}'` })
  );
  return errs;
}

/* ─── Semicolon check for JS ─────────────────────────────────────────────── */
function semicolonCheck(code, lang) {
  if (lang !== 'javascript' && lang !== 'typescript') return [];
  const errs = [];
  const lines = code.split('\n');
  lines.forEach((line, i) => {
    const t = line.trim();
    // Lines ending in a statement that likely needs semicolon
    if (t.length > 0
      && !t.endsWith(';') && !t.endsWith('{') && !t.endsWith('}')
      && !t.endsWith('(') && !t.endsWith(',') && !t.endsWith(':')
      && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*')
      && !t.startsWith('if') && !t.startsWith('else') && !t.startsWith('for')
      && !t.startsWith('while') && !t.startsWith('function') && !t.startsWith('class')
      && !t.startsWith('import') && !t.startsWith('export')
      && /^(return|const|let|var|throw)\s/.test(t)
    ) {
      errs.push({ line:i+1, msg:`Missing semicolon at end of line`, sev:'info', fix:'Add ; at end' });
    }
  });
  return errs;
}

/* ─── Main hook ─────────────────────────────────────────────────────────── */
export function useLinter(code, lang) {
  return useMemo(() => {
    if (!code || !lang) return [];
    const rules = RULES[lang] || [];
    const lines = code.split('\n');
    const diags = [];

    lines.forEach((line, idx) => {
      const t = line.trim();
      if (!t || t.startsWith('//') || t.startsWith('#') || t.startsWith('*')) return;
      rules.forEach(rule => {
        if (rule.re.test(line))
          diags.push({ line:idx+1, col: line.search(rule.re)+1, msg:rule.msg, sev:rule.sev, fix:rule.fix });
      });
    });

    structuralCheck(code, lang).forEach(e => diags.push(e));
    semicolonCheck(code, lang).forEach(e => diags.push(e));

    // Deduplicate same line+msg
    const seen = new Set();
    return diags.filter(d => {
      const k = `${d.line}:${d.msg}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }, [code, lang]);
}
