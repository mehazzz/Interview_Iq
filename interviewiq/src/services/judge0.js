/**
 * Judge0 Code Execution Service (FREE VERSION)
 */

const BASE_URL = 'https://ce.judge0.com';

const HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Execute Code
 */
const encode = (str) => btoa(unescape(encodeURIComponent(str)));

export async function executeCode(sourceCode, languageId, stdin = '') {
  const res = await fetch(
    `${BASE_URL}/submissions?base64_encoded=true&wait=true`,
    {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        source_code: encode(sourceCode),
        language_id: languageId,
        stdin: encode(stdin),
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Execution failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  return {
    status: data.status?.description,
    stdout: data.stdout ? atob(data.stdout) : '',
    stderr: data.stderr ? atob(data.stderr) : '',
    compileOutput: data.compile_output ? atob(data.compile_output) : '',
    accepted: data.status?.id === 3,
  };
}

/**
 * Polling
 */
async function poll(token, retries = 20, delay = 800) {
  for (let i = 0; i < retries; i++) {
    await sleep(delay);

    const res = await fetch(
      `${BASE_URL}/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr,compile_output,time,memory`,
      { headers: HEADERS }
    );

    if (!res.ok) continue;

    const data = await res.json();
    const statusId = data.status?.id;

    if (statusId === 1 || statusId === 2) continue;

    return {
      status: data.status?.description || 'Unknown',
      statusId,
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      compileOutput: data.compile_output || '',
      time: data.time,
      memory: data.memory,
      accepted: statusId === 3,
    };
  }

  throw new Error('Execution timed out');
}

/**
 * JS Test Runner
 */
export function buildJSTestRunner(userCode, testCases, functionName) {
  const tests = testCases.map((tc, i) => {
    const args = tc.input.map(a => JSON.stringify(a)).join(', ');
    return `
(function() {
  try {
    const result = ${functionName}(${args});
    const expected = ${JSON.stringify(tc.expected)};
    const pass = JSON.stringify(result) === JSON.stringify(expected);
    console.log(pass
      ? \`✓ Test ${i + 1} passed\`
      : \`✗ Test ${i + 1} failed — got: \${JSON.stringify(result)}, expected: \${JSON.stringify(expected)}\`
    );
  } catch(e) {
    console.log(\`✗ Test ${i + 1} threw: \${e.message}\`);
  }
})();`;
  }).join('\n');

  return `${userCode}\n\n// Auto tests\n${tests}`;
}

export function buildCppTestRunner(userCode, testCases, functionName) {
  const tests = testCases.map((tc, i) => {
    const inputArray = `{${tc.input[0].join(',')}}`; // assuming vector<int>
    const target = tc.input[1];
    const expected = `{${tc.expected.join(',')}}`;

    return `
    {
        vector<int> nums = ${inputArray};
        int target = ${target};

        vector<int> result = sol.${functionName}(nums, target);
        vector<int> expected = ${expected};

        if(result == expected) {
            cout << "PASS Test ${i + 1}\\n";
        } else {
            cout << "FAIL Test ${i + 1} ";
            cout << "got: ";
            for(int x : result) cout << x << " ";
            cout << " expected: ";
            for(int x : expected) cout << x << " ";
            cout << "\\n";
        }
    }`;
  }).join('\n');

  return `
#include <bits/stdc++.h>
using namespace std;

${userCode}

int main() {
    Solution sol;

    ${tests}

    return 0;
}
`;
}

/**
 * Python Test Runner
 */
export function buildPythonTestRunner(userCode, testCases, methodName) {
  const tests = testCases.map((tc, i) => {
    const args = tc.input.map(a => JSON.stringify(a)).join(', ');
    return `
try:
    result = sol.${methodName}(${args})
    expected = ${JSON.stringify(tc.expected)}
    if result == expected:
        print(f"✓ Test ${i + 1} passed")
    else:
        print(f"✗ Test ${i + 1} failed — got: {result}, expected: {expected}")
except Exception as e:
    print(f"✗ Test ${i + 1} threw: {e}")`;
  }).join('\n');

  return `${userCode}\n\nsol = Solution()\n${tests}`;
}

/**
 * Guess Function Name
 */
export function guessFunctionName(code, lang) {
  if (lang === 'javascript' || lang === 'typescript') {
    const m = code.match(/function\s+(\w+)\s*\(/);
    return m ? m[1] : 'solution';
  }
  if (lang === 'python') {
    const m = code.match(/def\s+(\w+)\s*\(/g);
    const defs = (m || [])
      .map(d => d.match(/def\s+(\w+)/)[1])
      .filter(n => !n.startsWith('_'));
    return defs[0] || 'solution';
  }
  return 'solution';
}

const sleep = ms => new Promise(r => setTimeout(r, ms));