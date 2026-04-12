// services/questionGenerator.service.js
// Generation layer: Uses templates + random values to produce unique questions every call

const { getTemplatesByDifficulty } = require('./rag.service.js');

// ─── Utility helpers ────────────────────────────────────────────────────────

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const roundTo = (n, decimals = 2) => Math.round(n * 10 ** decimals) / 10 ** decimals;

const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

const nCr = (n, r) => {
  if (r > n) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const shiftChar = (ch, shift) => {
  if (ch >= 'A' && ch <= 'Z') {
    return String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65);
  }
  return ch;
};

const shiftWord = (word, shift) => word.split('').map((c) => shiftChar(c, shift)).join('');

/** Generate 3 wrong options near the correct answer */
const generateWrongOptions = (correct, topic) => {
  const wrong = new Set();
  const base = typeof correct === 'number' ? correct : parseFloat(correct);
  const offsets = [
    roundTo(base * 0.8),
    roundTo(base * 1.2),
    roundTo(base + (base * 0.15)),
    roundTo(base - (base * 0.15)),
    roundTo(base + 1),
    roundTo(base - 1),
    roundTo(base * 2),
    roundTo(base / 2),
  ].filter((v) => v > 0 && v !== base);

  for (const o of offsets) {
    if (wrong.size >= 3) break;
    const display = Number.isInteger(o) ? o : roundTo(o);
    if (display !== base) wrong.add(display);
  }

  while (wrong.size < 3) wrong.add(roundTo(base + wrong.size + 1));
  return [...wrong];
};

/** Shuffle array of options and track correct answer label */
const buildOptions = (correct, wrongArr) => {
  const all = [correct, ...wrongArr.slice(0, 3)];
  // shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const labels = ['A', 'B', 'C', 'D'];
  const options = all.map((v, i) => `${labels[i]}) ${v}`);
  const correctLabel = labels[all.indexOf(correct)] + ') ' + correct;
  return { options, correctAnswer: correctLabel };
};

// ─── Topic-specific solvers ──────────────────────────────────────────────────

const solvers = {

  // TIME & WORK
  combined_time: (vars, template) => {
    const X = rand(vars.X), Y = rand(vars.Y);
    const combined = roundTo((X * Y) / (X + Y));
    const question = template.text.replace('{X}', X).replace('{Y}', Y);
    const wrong = generateWrongOptions(combined, 'time_work');
    const { options, correctAnswer } = buildOptions(combined, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `A's 1-day work = 1/${X}, B's 1-day work = 1/${Y}.\n` +
        `Combined rate = 1/${X} + 1/${Y} = ${X + Y}/${X * Y}.\n` +
        `Together they finish in ${X}×${Y}/(${X}+${Y}) = **${combined} days**.`,
    };
  },

  three_person_combined: (vars, template) => {
    const X = rand(vars.X), Y = rand(vars.Y), Z = rand(vars.Z);
    const combined = roundTo(1 / (1 / X + 1 / Y + 1 / Z));
    const question = template.text.replace('{X}', X).replace('{Y}', Y).replace('{Z}', Z);
    const wrong = generateWrongOptions(combined, 'time_work');
    const { options, correctAnswer } = buildOptions(combined, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Combined rate = 1/${X} + 1/${Y} + 1/${Z}\n` +
        `= ${Y * Z + X * Z + X * Y}/${X * Y * Z}\n` +
        `Together: **${combined} days**.`,
    };
  },

  efficiency: (vars, template) => {
    const K = rand(vars.K), Y = rand(vars.Y);
    const A = roundTo(Y / K);
    const question = template.text.replace('{K}', K).replace('{Y}', Y);
    const wrong = generateWrongOptions(A, 'time_work');
    const { options, correctAnswer } = buildOptions(A, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `A is ${K}× as efficient as B, so A takes 1/${K} of B's time.\n` +
        `A's time = ${Y} ÷ ${K} = **${A} days**.`,
    };
  },

  remaining_solo: (vars, template) => {
    const X = rand(vars.X), D = rand(vars.D), B_days = rand(vars.B);
    const worked = D / X;
    const remaining = roundTo(1 - worked);
    const B_total = roundTo(B_days / remaining);
    const question = template.text.replace('{X}', X).replace('{D}', D).replace('{B}', B_days);
    const wrong = generateWrongOptions(B_total, 'time_work');
    const { options, correctAnswer } = buildOptions(B_total, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `A completes ${D}/${X} of work in ${D} days.\n` +
        `Remaining = 1 - ${D}/${X} = ${remaining}\n` +
        `B finishes ${remaining} work in ${B_days} days.\n` +
        `B alone would take ${B_days}/${remaining} = **${B_total} days**.`,
    };
  },

  // TIME, SPEED & DISTANCE
  basic_speed: (vars, template) => {
    const D = rand(vars.D), T = rand(vars.T);
    const speed = roundTo(D / T);
    const question = template.text.replace('{D}', D).replace('{T}', T);
    const wrong = generateWrongOptions(speed, 'speed_distance');
    const { options, correctAnswer } = buildOptions(speed, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Speed = Distance / Time = ${D} / ${T} = **${speed} km/h**.`,
    };
  },

  avg_speed: (vars, template) => {
    const S1 = rand(vars.S1), S2 = rand(vars.S2);
    const avg = roundTo((2 * S1 * S2) / (S1 + S2));
    const question = template.text.replace('{S1}', S1).replace('{S2}', S2);
    const wrong = generateWrongOptions(avg, 'speed_distance');
    const { options, correctAnswer } = buildOptions(avg, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `For equal distances, Average Speed = 2S1·S2/(S1+S2)\n` +
        `= 2×${S1}×${S2}/(${S1}+${S2}) = ${2 * S1 * S2}/${S1 + S2} = **${avg} km/h**.`,
    };
  },

  trains_opposite: (vars, template) => {
    const L1 = rand(vars.L1), L2 = rand(vars.L2), S1 = rand(vars.S1), S2 = rand(vars.S2);
    const relSpeed = (S1 + S2) * (5 / 18); // m/s
    const time = roundTo((L1 + L2) / relSpeed);
    const question = template.text.replace('{L1}', L1).replace('{L2}', L2).replace('{S1}', S1).replace('{S2}', S2);
    const wrong = generateWrongOptions(time, 'speed_distance');
    const { options, correctAnswer } = buildOptions(time, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Relative speed = (${S1}+${S2}) km/h = ${S1 + S2}×5/18 = ${roundTo(relSpeed)} m/s\n` +
        `Total length = ${L1}+${L2} = ${L1 + L2} m\n` +
        `Time = ${L1 + L2}/${roundTo(relSpeed)} = **${time} seconds**.`,
    };
  },

  platform_speed: (vars, template) => {
    const L = rand(vars.L), P = rand(vars.P), T = rand(vars.T);
    const speedMs = roundTo((L + P) / T);
    const speedKmh = roundTo(speedMs * 18 / 5);
    const question = template.text.replace('{L}', L).replace('{P}', P).replace('{T}', T);
    const wrong = generateWrongOptions(speedKmh, 'speed_distance');
    const { options, correctAnswer } = buildOptions(speedKmh, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Total distance = Train length + Platform = ${L}+${P} = ${L + P} m\n` +
        `Speed = ${L + P}/${T} = ${speedMs} m/s\n` +
        `= ${speedMs} × 18/5 = **${speedKmh} km/h**.`,
    };
  },

  catch_up: (vars, template) => {
    const ST = rand(vars.ST), SP = rand(vars.SP), HEAD = rand(vars.HEAD);
    const headStart = (ST * HEAD) / 60; // km
    const relSpeed = SP - ST;
    const time = roundTo((headStart / relSpeed) * 60); // minutes
    const question = template.text.replace('{ST}', ST).replace('{SP}', SP).replace('{HEAD}', HEAD);
    const wrong = generateWrongOptions(time, 'speed_distance');
    const { options, correctAnswer } = buildOptions(time, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Head start distance = ${ST} × ${HEAD}/60 = ${roundTo(headStart)} km\n` +
        `Relative speed = ${SP} - ${ST} = ${relSpeed} km/h\n` +
        `Time = ${roundTo(headStart)}/${relSpeed} hours = **${time} minutes**.`,
    };
  },

  // PROFIT & LOSS
  basic_profit_pct: (vars, template) => {
    const CP = rand(vars.CP);
    const margin = rand(vars.SP_MARGIN);
    const SP = CP + Math.round((margin / 100) * CP);
    const profit = roundTo(((SP - CP) / CP) * 100);
    const question = template.text.replace('{CP}', CP).replace('{SP}', SP);
    const wrong = generateWrongOptions(profit, 'profit_loss');
    const { options, correctAnswer } = buildOptions(profit, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Profit = SP - CP = ${SP} - ${CP} = ₹${SP - CP}\n` +
        `Profit% = (${SP - CP}/${CP}) × 100 = **${profit}%**.`,
    };
  },

  find_sp: (vars, template) => {
    const CP = rand(vars.CP), P = rand(vars.P);
    const SP = roundTo(CP * (1 + P / 100));
    const question = template.text.replace('{CP}', CP).replace('{P}', P);
    const wrong = generateWrongOptions(SP, 'profit_loss');
    const { options, correctAnswer } = buildOptions(SP, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `SP = CP × (100 + P%)/100\n= ${CP} × ${100 + P}/100\n= **₹${SP}**.`,
    };
  },

  discount_profit: (vars, template) => {
    const MP = rand(vars.MP), D = rand(vars.D);
    const cpRatio = rand(vars.CP_RATIO);
    const CP = roundTo(MP * cpRatio);
    const SP = roundTo(MP * (1 - D / 100));
    const profitPct = roundTo(((SP - CP) / CP) * 100);
    const question = template.text.replace('{MP}', MP).replace('{D}', D).replace('{CP}', CP);
    const wrong = generateWrongOptions(profitPct, 'profit_loss');
    const { options, correctAnswer } = buildOptions(profitPct, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `SP after ${D}% discount = ${MP}×(1-${D}/100) = ₹${SP}\n` +
        `Profit% = (${SP}-${CP})/${CP}×100 = **${profitPct}%**.`,
    };
  },

  successive: (vars, template) => {
    const M = rand(vars.M), D = rand(vars.D);
    const SP = 100 * (1 + M / 100) * (1 - D / 100);
    const result = roundTo(SP - 100);
    const label = result >= 0 ? `Profit of ${result}%` : `Loss of ${Math.abs(result)}%`;
    const question = template.text.replace('{M}', M).replace('{D}', D);
    const wrong = generateWrongOptions(Math.abs(result), 'profit_loss');
    const { options, correctAnswer } = buildOptions(label, [label + 'x', label + 'y', label + 'z'].slice(0, 3));
    const opts = [`${result >= 0 ? 'Profit' : 'Loss'} of ${Math.abs(result)}%`,
      `${result >= 0 ? 'Loss' : 'Profit'} of ${Math.abs(result)}%`,
      `Profit of ${Math.abs(result) + 5}%`,
      `Loss of ${Math.abs(result) + 5}%`];
    return {
      question,
      options: opts,
      correctAnswer: opts[0],
      explanation: `Let CP = ₹100. After ${M}% markup, MP = ₹${100 + M}.\n` +
        `After ${D}% discount, SP = ${100 + M}×(1-${D}/100) = ₹${roundTo(SP)}.\n` +
        `Net = ${roundTo(result)}% → **${label}**.`,
    };
  },

  find_cp_from_loss: (vars, template) => {
    const SP = rand(vars.SP), L = rand(vars.L);
    const CP = roundTo(SP * 100 / (100 - L));
    const question = template.text.replace('{SP}', SP).replace('{L}', L);
    const wrong = generateWrongOptions(CP, 'profit_loss');
    const { options, correctAnswer } = buildOptions(CP, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `SP = CP × (100-L%)/100\n` +
        `CP = SP × 100/(100-L) = ${SP}×100/${100 - L} = **₹${CP}**.`,
    };
  },

  // PERCENTAGE
  basic_pct: (vars, template) => {
    const P = rand(vars.P), N = rand(vars.N);
    const result = roundTo((P / 100) * N);
    const question = template.text.replace('{P}', P).replace('{N}', N);
    const wrong = generateWrongOptions(result, 'percentage');
    const { options, correctAnswer } = buildOptions(result, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `${P}% of ${N} = (${P}/100) × ${N} = **${result}**.`,
    };
  },

  net_change: (vars, template) => {
    const P = rand(vars.P), Q = rand(vars.Q);
    const result = roundTo(((1 + P / 100) * (1 - Q / 100) - 1) * 100);
    const label = result >= 0 ? `${result}% increase` : `${Math.abs(result)}% decrease`;
    const question = template.text.replace('{P}', P).replace('{Q}', Q);
    const opts = [`${Math.abs(result)}% ${result >= 0 ? 'increase' : 'decrease'}`,
      `${Math.abs(result) + 5}% increase`,
      `${Math.abs(result) + 5}% decrease`,
      `No change`];
    return {
      question,
      options: opts,
      correctAnswer: opts[0],
      explanation: `Net = (1+${P}/100)×(1-${Q}/100) - 1\n` +
        `= ${roundTo(1 + P / 100)}×${roundTo(1 - Q / 100)} - 1 = **${label}**.`,
    };
  },

  population: (vars, template) => {
    const N = rand(vars.N), P = rand(vars.P), Q = rand(vars.Q);
    const result = Math.round(N * (1 + P / 100) * (1 - Q / 100));
    const question = template.text.replace('{N}', N).replace('{P}', P).replace('{Q}', Q);
    const wrong = generateWrongOptions(result, 'percentage');
    const { options, correctAnswer } = buildOptions(result, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `After year 1: ${N}×(1+${P}/100) = ${Math.round(N * (1 + P / 100))}\n` +
        `After year 2: ×(1-${Q}/100) = **${result}**.`,
    };
  },

  // RATIO & PROPORTION
  divide_ratio: (vars, template) => {
    const TOTAL = rand(vars.TOTAL), R1 = rand(vars.R1), R2 = rand(vars.R2);
    const A_share = roundTo((R1 / (R1 + R2)) * TOTAL);
    const B_share = roundTo(TOTAL - A_share);
    const question = template.text.replace('{TOTAL}', TOTAL).replace('{R1}', R1).replace('{R2}', R2);
    const opts = [`A=₹${A_share}, B=₹${B_share}`, `A=₹${B_share}, B=₹${A_share}`,
      `A=₹${A_share + 10}, B=₹${B_share - 10}`, `A=₹${A_share - 10}, B=₹${B_share + 10}`];
    return {
      question,
      options: opts,
      correctAnswer: opts[0],
      explanation: `Total parts = ${R1}+${R2} = ${R1 + R2}\n` +
        `A = ${R1}/${R1 + R2}×${TOTAL} = **₹${A_share}**\n` +
        `B = ${R2}/${R1 + R2}×${TOTAL} = **₹${B_share}**.`,
    };
  },

  three_way_ratio: (vars, template) => {
    const TOTAL = rand(vars.TOTAL), R1 = rand(vars.R1), R2 = rand(vars.R2), R3 = rand(vars.R3);
    const sum = R1 + R2 + R3;
    const B_share = roundTo((R2 / sum) * TOTAL);
    const question = template.text.replace('{TOTAL}', TOTAL).replace('{R1}', R1).replace('{R2}', R2).replace('{R3}', R3);
    const wrong = generateWrongOptions(B_share, 'ratio');
    const { options, correctAnswer } = buildOptions(B_share, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Total parts = ${R1}+${R2}+${R3} = ${sum}\n` +
        `B's share = ${R2}/${sum}×${TOTAL} = **₹${B_share}**.`,
    };
  },

  // AVERAGES
  replacement_avg: (vars, template) => {
    const N = rand(vars.N), A = rand(vars.A), OLD = rand(vars.OLD), NEW = rand(vars.NEW);
    const oldSum = N * A;
    const newSum = oldSum - OLD + NEW;
    const newAvg = roundTo(newSum / N);
    const question = template.text.replace('{N}', N).replace('{A}', A).replace('{OLD}', OLD).replace('{NEW}', NEW);
    const wrong = generateWrongOptions(newAvg, 'averages');
    const { options, correctAnswer } = buildOptions(newAvg, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Old sum = ${N}×${A} = ${oldSum}\n` +
        `New sum = ${oldSum} - ${OLD} + ${NEW} = ${newSum}\n` +
        `New average = ${newSum}/${N} = **${newAvg}**.`,
    };
  },

  cricket_avg: (vars, template) => {
    const M = rand(vars.M), A = rand(vars.A), NM = rand(vars.NM), INC = rand(vars.INC);
    const oldTotal = M * A;
    const newAvg = A + INC;
    const newTotal = (M + NM) * newAvg;
    const lastRuns = newTotal - oldTotal;
    const question = template.text.replace('{M}', M).replace('{A}', A).replace('{NM}', NM).replace('{INC}', INC);
    const wrong = generateWrongOptions(lastRuns, 'averages');
    const { options, correctAnswer } = buildOptions(lastRuns, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Old total = ${M}×${A} = ${oldTotal}\n` +
        `New average = ${A}+${INC} = ${newAvg}\n` +
        `New total = ${M + NM}×${newAvg} = ${newTotal}\n` +
        `Last ${NM} matches = ${newTotal}-${oldTotal} = **${lastRuns} runs**.`,
    };
  },

  // NUMBER SYSTEM
  lcm_hcf_find: (vars, template) => {
    const H = rand(vars.H);
    const L = H * rand(vars.L_MULT);
    const A = H * rand(vars.A_MULT);
    const B = roundTo(L / A * H);
    const question = template.text.replace('{H}', H).replace('{L}', L).replace('{A}', A);
    const wrong = generateWrongOptions(B, 'number_system');
    const { options, correctAnswer } = buildOptions(B, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `LCM × HCF = A × B\n` +
        `${L} × ${H} = ${A} × B\n` +
        `B = ${L * H} / ${A} = **${B}**.`,
    };
  },

  largest_divisible: (vars, template) => {
    const DIGIT = rand(vars.DIGIT), D = rand(vars.D);
    const maxNum = Math.pow(10, DIGIT) - 1;
    const result = maxNum - (maxNum % D);
    const question = template.text.replace('{DIGIT}', DIGIT).replace('{D}', D);
    const wrong = generateWrongOptions(result, 'number_system');
    const { options, correctAnswer } = buildOptions(result, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Largest ${DIGIT}-digit number = ${maxNum}\n` +
        `${maxNum} ÷ ${D} = ${Math.floor(maxNum / D)} remainder ${maxNum % D}\n` +
        `So largest divisible = ${maxNum} - ${maxNum % D} = **${result}**.`,
    };
  },

  // PERMUTATIONS & COMBINATIONS
  factorial: (vars, template) => {
    const N = rand(vars.N);
    const result = factorial(N);
    const question = template.text.replace('{N}', N);
    const wrong = [factorial(N - 1), factorial(N + 1), factorial(N) * 2].filter((v) => v !== result);
    const { options, correctAnswer } = buildOptions(result, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Arrangements of ${N} people = ${N}! = ${Array.from({ length: N }, (_, i) => N - i).join('×')} = **${result}**.`,
    };
  },

  combination: (vars, template) => {
    const N = rand(vars.N), R = rand(vars.R);
    const result = nCr(N, R);
    const question = template.text.replace('{N}', N).replace('{R}', R);
    const wrong = [nCr(N, R + 1), nCr(N - 1, R), nCr(N + 1, R)].filter((v) => v !== result && v > 0);
    const { options, correctAnswer } = buildOptions(result, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `C(${N},${R}) = ${N}! / (${R}! × ${N - R}!)\n` +
        `= ${factorial(N)} / (${factorial(R)} × ${factorial(N - R)}) = **${result}**.`,
    };
  },

  word_perm: (vars, template) => {
    const WORD = rand(vars.WORD), LEN = rand(vars.LEN);
    const N = WORD.length;
    let result = 1;
    for (let i = 0; i < LEN; i++) result *= (N - i);
    const question = template.text.replace('{LEN}', LEN).replace('{WORD}', WORD);
    const wrong = generateWrongOptions(result, 'pc');
    const { options, correctAnswer } = buildOptions(result, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `'${WORD}' has ${N} unique letters.\n` +
        `P(${N},${LEN}) = ${N}×${N - 1}×...×${N - LEN + 1} = **${result}**.`,
    };
  },

  // PROBABILITY
  card_prob: (vars, template) => {
    const SUIT = rand(vars.SUIT);
    const probMap = {
      heart: [13, 52], spade: [13, 52], club: [13, 52], diamond: [13, 52],
      king: [4, 52], queen: [4, 52], ace: [4, 52],
      'red card': [26, 52], 'face card': [12, 52],
    };
    const [fav, total] = probMap[SUIT] || [1, 52];
    const g = gcd(fav, total);
    const result = `${fav / g}/${total / g}`;
    const question = template.text.replace('{SUIT}', SUIT);
    const opts = [result, `${fav + 1}/${total}`, `${fav}/${total + 4}`, `${fav - 1}/${total}`].filter(Boolean);
    return {
      question,
      options: opts.slice(0, 4),
      correctAnswer: result,
      explanation: `Favorable outcomes (${SUIT}) = ${fav}, Total cards = ${total}\n` +
        `P = ${fav}/${total} = **${result}**.`,
    };
  },

  dice_prob: (vars, template) => {
    const SUM = rand(vars.SUM);
    const diceSums = { 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3 };
    const fav = diceSums[SUM] || 3;
    const g = gcd(fav, 36);
    const result = `${fav / g}/${36 / g}`;
    const question = template.text.replace('{SUM}', SUM);
    const opts = [result, `${fav + 1}/36`, `1/6`, `${fav}/36`].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    return {
      question,
      options: opts,
      correctAnswer: result,
      explanation: `Possible outcomes for sum ${SUM} with 2 dice = ${fav} ways out of 36.\n` +
        `P(sum=${SUM}) = ${fav}/36 = **${result}**.`,
    };
  },

  balls_prob: (vars, template) => {
    const R = rand(vars.R), G = rand(vars.G), B = rand(vars.B), COLOR = rand(vars.COLOR);
    const total = R + G + B;
    const favMap = { red: R, green: G, blue: B, 'not red': G + B };
    const fav = favMap[COLOR];
    const g = gcd(fav, total);
    const result = `${fav / g}/${total / g}`;
    const question = template.text.replace('{R}', R).replace('{G}', G).replace('{B}', B).replace('{COLOR}', COLOR);
    const opts = [result, `${fav + 1}/${total}`, `${fav}/${total + 2}`, `${Math.max(1, fav - 1)}/${total}`].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    return {
      question,
      options: opts,
      correctAnswer: result,
      explanation: `Total balls = ${R}+${G}+${B} = ${total}\n` +
        `Favorable (${COLOR}) = ${fav}\nP = ${fav}/${total} = **${result}**.`,
    };
  },

  // MIXTURES & ALLIGATIONS
  alligation_ratio: (vars, template) => {
    const C = rand(vars.C);
    const D = C + rand(vars.D_ADD);
    const M = C + rand(vars.M_ADD);
    if (M >= D) return solvers.alligation_ratio(vars, template);
    const dearer = D - M, cheaper = M - C;
    const g = gcd(dearer, cheaper);
    const result = `${cheaper / g}:${dearer / g}`;
    const question = template.text.replace('{C}', C).replace('{D}', D).replace('{M}', M);
    const opts = [result, `${dearer / g}:${cheaper / g}`, `${cheaper}:${dearer + 1}`, `${cheaper + 1}:${dearer}`];
    return {
      question,
      options: opts,
      correctAnswer: result,
      explanation: `By alligation rule:\nCheaper ←→ Dearer\n${C}  ←→  ${D}\n    ${M} (mean)\n` +
        `Cheaper part = ${D}-${M} = ${dearer}\nDearer part = ${M}-${C} = ${cheaper}\n` +
        `Ratio = ${cheaper}:${dearer} = **${result}**.`,
    };
  },

  milk_water: (vars, template) => {
    const L = rand(vars.L), R = rand(vars.R), TIMES = rand(vars.TIMES);
    const fraction = roundTo(Math.pow((L - R) / L, TIMES), 4);
    const milkLeft = roundTo(L * fraction, 2);
    const question = template.text.replace('{L}', L).replace('{R}', R).replace('{TIMES}', TIMES);
    const opts = [`${fraction} (${milkLeft}L of ${L}L)`,
      `${roundTo(fraction + 0.1, 4)}`,
      `${roundTo(fraction - 0.05, 4)}`,
      `${roundTo(Math.pow((L - R) / L, TIMES - 1), 4)}`].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    return {
      question,
      options: opts,
      correctAnswer: opts[0],
      explanation: `After each replacement, milk fraction = ((L-R)/L)^n\n` +
        `= ((${L}-${R})/${L})^${TIMES} = (${L - R}/${L})^${TIMES} = **${fraction}**\n` +
        `Milk remaining = ${L}×${fraction} = ${milkLeft} litres.`,
    };
  },

  // SIMPLIFICATION
  bodmas_calc: (vars, template) => {
    const A = rand(vars.A), B = rand(vars.B), C = rand(vars.C), D = rand(vars.D), E = rand(vars.E);
    const result = A + B * C - D / E;
    const rounded = roundTo(result);
    const question = template.text.replace('{A}', A).replace('{B}', B).replace('{C}', C).replace('{D}', D).replace('{E}', E);
    const wrong = generateWrongOptions(rounded, 'simplification');
    const { options, correctAnswer } = buildOptions(rounded, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Apply BODMAS: × and ÷ before + and −\n` +
        `= ${A} + (${B}×${C}) - (${D}÷${E})\n` +
        `= ${A} + ${B * C} - ${D / E}\n= **${rounded}**.`,
    };
  },

  // LOGICAL REASONING
  syllogism: (vars, template) => {
    const set = rand(vars.SETS);
    const [A, B, C] = set;
    const question = template.text
      .replace(/{A}/g, A).replace(/{B}/g, B).replace(/{C}/g, C);
    const opts = [
      'Both Conclusion I and II follow',
      'Only Conclusion I follows',
      'Only Conclusion II follows',
      'Neither follows',
    ];
    return {
      question,
      options: opts,
      correctAnswer: opts[0],
      explanation: `All ${A} → ${B}, All ${B} → ${C}\n` +
        `By transitivity: All ${A} → ${C} ✓ (Conclusion I follows)\n` +
        `Since All ${A} are ${C}, some ${C} must be ${A} ✓ (Conclusion II follows)\n` +
        `**Both conclusions follow**.`,
    };
  },

  // BLOOD RELATIONS
  blood_relations: (vars, template) => {
    const puzzle = rand(vars.PUZZLES);
    const question = template.text
      .replace('{NAME1}', puzzle.name1).replace('{NAME2}', puzzle.name2)
      .replace('{RELATION1}', puzzle.r1).replace('{RELATION2}', puzzle.r2)
      .replace('{RELATION3}', puzzle.r3);
    const opts = [puzzle.answer, 'Uncle', 'Nephew', 'Cousin'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    return {
      question,
      options: opts,
      correctAnswer: puzzle.answer,
      explanation: puzzle.explanation,
    };
  },

  // CODING-DECODING
  shift_code: (vars, template) => {
    const SHIFT = rand(vars.SHIFT);
    const allWords = vars.WORDS;
    const WORD = rand(allWords);
    const CODED = shiftWord(WORD, SHIFT);
    const remaining = allWords.filter((w) => w !== WORD);
    const TARGET = rand(remaining);
    const TARGET_CODED = shiftWord(TARGET, SHIFT);
    const question = template.text.replace('{WORD}', WORD).replace('{CODED}', CODED).replace('{TARGET}', TARGET);
    const wrong1 = shiftWord(TARGET, SHIFT + 1);
    const wrong2 = shiftWord(TARGET, SHIFT - 1 < 0 ? 25 : SHIFT - 1);
    const wrong3 = shiftWord(TARGET, SHIFT + 2);
    const opts = [TARGET_CODED, wrong1, wrong2, wrong3].filter((v, i, a) => a.indexOf(v) === i && v !== TARGET_CODED || v === TARGET_CODED).slice(0, 4);
    return {
      question,
      options: [...new Set([TARGET_CODED, wrong1, wrong2, wrong3])].slice(0, 4),
      correctAnswer: TARGET_CODED,
      explanation: `Pattern: each letter shifted forward by ${SHIFT} positions.\n` +
        `${WORD} → ${CODED} (shift +${SHIFT})\n` +
        `Therefore ${TARGET} → **${TARGET_CODED}**.`,
    };
  },

  // SERIES
  ap_series: (vars, template) => {
    const START = rand(vars.START), DIFF = rand(vars.DIFF);
    const terms = Array.from({ length: vars.TERMS }, (_, i) => START + i * DIFF);
    const next = START + vars.TERMS * DIFF;
    const seriesStr = [...terms, '?'].join(', ');
    const question = `Find the next term: ${seriesStr}`;
    const wrong = [next + DIFF, next - DIFF, next + 1];
    const { options, correctAnswer } = buildOptions(next, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Series: ${terms.join(', ')},...\nCommon difference = ${DIFF}\nNext term = ${terms[terms.length - 1]} + ${DIFF} = **${next}**.`,
    };
  },

  gp_series: (vars, template) => {
    const START = rand(vars.START), RATIO = rand(vars.RATIO);
    const terms = Array.from({ length: vars.TERMS }, (_, i) => START * Math.pow(RATIO, i));
    const missingIdx = rand([1, 2, 3]);
    const missingVal = terms[missingIdx];
    const display = [...terms];
    display[missingIdx] = '?';
    const question = `Find the missing term: ${display.join(', ')}`;
    const wrong = [missingVal * RATIO, missingVal / RATIO, missingVal + START];
    const { options, correctAnswer } = buildOptions(missingVal, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Series starts at ${START} with ratio ×${RATIO}.\nTerm at position ${missingIdx + 1} = ${START}×${RATIO}^${missingIdx} = **${missingVal}**.`,
    };
  },

  squares_series: (vars, template) => {
    const START = rand(vars.START);
    const terms = Array.from({ length: vars.TERMS }, (_, i) => Math.pow(START + i, 2));
    const next = Math.pow(START + vars.TERMS, 2);
    const question = `Find the next term: ${[...terms, '?'].join(', ')}`;
    const wrong = [next + 1, next - 1, Math.pow(START + vars.TERMS + 1, 2)];
    const { options, correctAnswer } = buildOptions(next, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Pattern: ${Array.from({ length: vars.TERMS }, (_, i) => `${START + i}²=${terms[i]}`).join(', ')}\nNext = ${START + vars.TERMS}² = **${next}**.`,
    };
  },

  // DATA INTERPRETATION
  di_table: (vars, template) => {
    const BASE = rand(vars.BASE);
    const GROWTH = rand(vars.GROWTH);
    const years = vars.YEARS.slice(-4);
    const sales = years.map((_, i) => Math.round(BASE * Math.pow(1 + GROWTH / 100, i)));
    const maxYear = years[sales.indexOf(Math.max(...sales))];
    const totalGrowth = roundTo(((sales[sales.length - 1] - sales[0]) / sales[0]) * 100);
    const tableDesc = years.map((y, i) => `${y}: ₹${sales[i]}Cr`).join(', ');
    const question = `Sales data — ${tableDesc}. What is the total % growth from ${years[0]} to ${years[years.length - 1]}?`;
    const wrong = generateWrongOptions(totalGrowth, 'di');
    const { options, correctAnswer } = buildOptions(totalGrowth, wrong);
    return {
      question,
      options,
      correctAnswer,
      explanation: `Growth = (${sales[sales.length - 1]} - ${sales[0]}) / ${sales[0]} × 100\n= **${totalGrowth}%**.`,
    };
  },
};

// ─── Main exported function ──────────────────────────────────────────────────

/**
 * Generate `count` questions for a given topic and difficulty
 */
const generateQuestions = (topicId, difficulty = 'medium', count = 5) => {
  const templates = getTemplatesByDifficulty(topicId, difficulty);
  if (!templates || templates.length === 0) {
    throw new Error(`No templates found for topic "${topicId}" with difficulty "${difficulty}"`);
  }

  const questions = [];
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const solver = solvers[template.solution];
    if (!solver) {
      console.warn(`No solver for "${template.solution}", skipping.`);
      continue;
    }
    try {
      const q = solver(template.vars, template);
      questions.push({
        id: `${topicId}_${Date.now()}_${i}`,
        ...q,
        difficulty: rand(template.difficulty),
        topic: topicId,
      });
    } catch (err) {
      console.error(`Error generating question for ${topicId}:`, err.message);
    }
  }
  return questions;
};

module.exports = { generateQuestions };