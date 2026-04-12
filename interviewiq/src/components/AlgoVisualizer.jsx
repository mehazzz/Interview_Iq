import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   FRAME GENERATORS — each returns array of frames describing every
   single step of the algorithm with kid-friendly explanation
   ═══════════════════════════════════════════════════════════════════ */

function genTwoSum(arr, target) {
  const frames = [];
  const map = {};
  frames.push({
    type:'twosum', arr, map:{}, i:null, highlight:[], found:[],
    title:'🎯 Two Sum — Find the Pair!',
    story:`We need to find two numbers in the array that ADD UP to ${target}. Imagine you have a magic notebook 📓 where you write down each number you see!`,
    code:'const map = new Map(); // our magic notebook',
    phase:'start',
  });
  for (let i=0; i<arr.length; i++) {
    const need = target - arr[i];
    frames.push({
      type:'twosum', arr, map:{...map}, i, need, highlight:[i], found:[],
      title:`🔍 Looking at index ${i} (value = ${arr[i]})`,
      story:`We pick up the number ${arr[i]} 🎲 and ask: "What number do I need to make ${target}?" The answer is ${target} - ${arr[i]} = ${need}. Let's check our notebook!`,
      code:`const need = ${target} - nums[${i}] = ${need}`,
      phase:'check',
    });
    if (map[need] !== undefined) {
      frames.push({
        type:'twosum', arr, map:{...map}, i, need, highlight:[map[need],i], found:[map[need],i],
        title:`🎉 FOUND IT! Indices [${map[need]}, ${i}]`,
        story:`YES! The notebook has ${need} at index ${map[need]}! So ${arr[map[need]]} + ${arr[i]} = ${target} ✅ We return [${map[need]}, ${i}]!`,
        code:`return [map.get(${need}), ${i}] = [${map[need]}, ${i}]`,
        phase:'done',
      });
      return frames;
    }
    map[arr[i]] = i;
    frames.push({
      type:'twosum', arr, map:{...map}, i, highlight:[i], found:[],
      title:`📝 Writing ${arr[i]} → index ${i} in notebook`,
      story:`${need} is NOT in our notebook yet. So we write "${arr[i]}: index ${i}" in our notebook 📓 and move on!`,
      code:`map.set(${arr[i]}, ${i}) // write in notebook`,
      phase:'store',
    });
  }
  return frames;
}

function genBinarySearch(arr, target) {
  const frames = [];
  frames.push({
    type:'bsearch', arr, l:0, r:arr.length-1, m:null, target,
    title:'🔍 Binary Search — Guess the Middle!',
    story:`Imagine finding a word in a dictionary 📖. Do you start from page 1? No! You open the MIDDLE and check. That's binary search — we keep halving the search space!`,
    code:`let l=0, r=${arr.length-1} // left and right boundaries`,
    phase:'start',
  });
  let l=0, r=arr.length-1;
  while (l<=r) {
    const m = (l+r)>>1;
    frames.push({
      type:'bsearch', arr, l, r, m, target,
      title:`📖 Check middle index ${m} (value = ${arr[m]})`,
      story:`Search zone: indices ${l} to ${r} 🟦. Middle is index ${m}, value is ${arr[m]}. We're looking for ${target}. ${arr[m]===target?`That's our target! 🎉`:`${arr[m]}<${target}?`} ${arr[m]<target?`Yes → look RIGHT half`:`No → look LEFT half`}`,
      code:`mid = (${l}+${r})>>1 = ${m} → nums[${m}] = ${arr[m]}`,
      phase: arr[m]===target ? 'done' : 'check',
    });
    if (arr[m]===target) {
      frames.push({
        type:'bsearch', arr, l, r, m, target, resultIdx:m,
        title:`🎊 Found ${target} at index ${m}!`,
        story:`We found ${target} at index ${m} in just ${frames.length} steps! If we searched one by one it could take up to ${arr.length} steps. Binary search is SUPER fast! ⚡`,
        code:`return ${m} // found!`,
        phase:'done',
      });
      return frames;
    }
    if (arr[m]<target) {
      frames.push({
        type:'bsearch', arr, l:m+1, r, m, target,
        title:`➡️ ${arr[m]} < ${target} — Search RIGHT half`,
        story:`${arr[m]} is SMALLER than ${target} 🔢. Since the array is sorted, ${target} must be to the RIGHT. We move our left boundary to ${m+1}. Eliminated ${m+1} numbers! 🗑️`,
        code:`l = mid + 1 = ${m+1} // discard left half`,
        phase:'narrow',
      });
      l=m+1;
    } else {
      frames.push({
        type:'bsearch', arr, l, r:m-1, m, target,
        title:`⬅️ ${arr[m]} > ${target} — Search LEFT half`,
        story:`${arr[m]} is BIGGER than ${target} 🔢. Since the array is sorted, ${target} must be to the LEFT. We move our right boundary to ${m-1}. Eliminated ${arr.length-m} numbers! 🗑️`,
        code:`r = mid - 1 = ${m-1} // discard right half`,
        phase:'narrow',
      });
      r=m-1;
    }
  }
  frames.push({
    type:'bsearch', arr, l, r, m:null, target, resultIdx:-1,
    title:`❌ ${target} not in array`,
    story:`We've narrowed the search to nothing (l=${l} > r=${r}). The number ${target} doesn't exist in our array. Return -1.`,
    code:`return -1 // not found`,
    phase:'done',
  });
  return frames;
}

function genBubbleSort(arr) {
  const frames = [];
  const a = [...arr];
  const sortedFrom = a.length;
  frames.push({
    type:'sort', arr:[...a], comparing:[], sorted:[], swapped:false,
    title:'🫧 Bubble Sort — Bubbling Up!',
    story:`Imagine bubbles rising to the surface 🫧. Big numbers "bubble up" to the right. We compare neighbors — if the left is BIGGER, we swap! We repeat until everything is sorted.`,
    code:`// Compare neighbors, swap if out of order`,
    phase:'start', sortedCount:0,
  });
  let sortedCount = 0;
  for (let i=0; i<a.length-1; i++) {
    let swappedAny = false;
    for (let j=0; j<a.length-i-1; j++) {
      frames.push({
        type:'sort', arr:[...a], comparing:[j,j+1], sorted:a.map((_,k)=>k).slice(a.length-sortedCount),
        swapped:false,
        title:`👀 Comparing a[${j}]=${a[j]} vs a[${j+1}]=${a[j+1]}`,
        story:`We look at two neighbors: ${a[j]} and ${a[j+1]}. ${a[j]>a[j+1]?`${a[j]} is BIGGER 😤 — they need to swap!`:`${a[j]} is smaller ✅ — they're fine, move on!`}`,
        code:`arr[${j}]=${a[j]} ${a[j]>a[j+1]?'>':' <='} arr[${j+1}]=${a[j+1]} → ${a[j]>a[j+1]?'SWAP!':'no swap'}`,
        phase:'compare', sortedCount,
      });
      if (a[j]>a[j+1]) {
        [a[j],a[j+1]]=[a[j+1],a[j]];
        swappedAny = true;
        frames.push({
          type:'sort', arr:[...a], comparing:[j,j+1], sorted:a.map((_,k)=>k).slice(a.length-sortedCount),
          swapped:true,
          title:`🔄 Swapped! Array is now [${a.join(', ')}]`,
          story:`We swapped them! The bigger number moved right 👉 like a bubble rising up. The array is getting more sorted!`,
          code:`[arr[${j}], arr[${j+1}}]] = [arr[${j+1}], arr[${j}]]`,
          phase:'swap', sortedCount,
        });
      }
    }
    sortedCount++;
    frames.push({
      type:'sort', arr:[...a], comparing:[], sorted:a.map((_,k)=>k).slice(a.length-sortedCount),
      swapped:false,
      title:`✅ Pass ${i+1} done — ${sortedCount} number${sortedCount>1?'s':''} in final position!`,
      story:`After this pass, the ${sortedCount} largest number${sortedCount>1?'s are':' is'} in the correct spot (shown in 🟢). ${swappedAny?`We still need to sort the rest!`:`No swaps happened — array is SORTED! 🎊`}`,
      code:`// Pass ${i+1} complete, ${sortedCount} elements sorted`,
      phase: swappedAny ? 'pass' : 'done', sortedCount,
    });
    if (!swappedAny) break;
  }
  if (sortedCount < a.length) {
    frames.push({
      type:'sort', arr:[...a], comparing:[], sorted:a.map((_,k)=>k),
      title:`🎊 Fully Sorted! [${a.join(', ')}]`,
      story:`The entire array is sorted! 🌈 Every number is in its right place. Bubble sort done!`,
      code:`// Array is sorted: [${a.join(', ')}]`,
      phase:'done', sortedCount:a.length,
    });
  }
  return frames;
}

function genKadane(arr) {
  const frames = [];
  let cur=arr[0], max=arr[0], wStart=0, wEnd=0, maxStart=0, maxEnd=0;
  frames.push({
    type:'kadane', arr, cur, max, i:0, wStart, wEnd, maxStart, maxEnd, highlight:[0],
    title:`💰 Kadane's Algorithm — Max Treasure Hunt!`,
    story:`Imagine walking along a path collecting treasure 💰. At each spot you decide: "Should I continue this journey or START FRESH from here?" We always keep track of the BEST total we've ever seen!`,
    code:`let cur = nums[0] = ${arr[0]}, max = ${arr[0]}`,
    phase:'start',
  });
  for (let i=1; i<arr.length; i++) {
    const extend = cur+arr[i];
    const restart = arr[i];
    const shouldRestart = restart > extend;
    frames.push({
      type:'kadane', arr, cur, max, i, wStart, wEnd:i-1, maxStart, maxEnd, highlight:[i],
      title:`🤔 Index ${i} (${arr[i]}) — Extend or Restart?`,
      story:`We're at index ${i} with value ${arr[i]} ${arr[i]>=0?'💰':'💸'}. If we EXTEND: ${cur}+${arr[i]}=${extend}. If we RESTART fresh: ${restart}. We pick the BIGGER one: ${Math.max(extend,restart)}!`,
      code:`max(cur+nums[${i}], nums[${i}]) = max(${extend}, ${restart}) = ${Math.max(extend,restart)}`,
      phase:'decide',
    });
    if (shouldRestart) {
      cur=restart; wStart=i; wEnd=i;
      frames.push({
        type:'kadane', arr, cur, max, i, wStart, wEnd, maxStart, maxEnd, highlight:[i],
        title:`🔄 Starting FRESH at index ${i}`,
        story:`Restarting! The old path was dragging us down. We drop everything and start a NEW journey from ${arr[i]} 🆕`,
        code:`cur = ${cur} // fresh start`,
        phase:'restart',
      });
    } else {
      cur=extend; wEnd=i;
      frames.push({
        type:'kadane', arr, cur, max, i, wStart, wEnd, maxStart, maxEnd, highlight:[i],
        title:`➕ Extending! cur = ${cur}`,
        story:`Extending our journey! Adding ${arr[i]} to our running total. Current window [${arr.slice(wStart,wEnd+1).join(',')}] sums to ${cur} 💪`,
        code:`cur = ${cur} // extended`,
        phase:'extend',
      });
    }
    if (cur>max) {
      max=cur; maxStart=wStart; maxEnd=wEnd;
      frames.push({
        type:'kadane', arr, cur, max, i, wStart, wEnd, maxStart, maxEnd, newMax:true, highlight:[i],
        title:`🏆 NEW BEST! max = ${max}`,
        story:`This is our best total EVER! The subarray [${arr.slice(maxStart,maxEnd+1).join(', ')}] gives us ${max} 🏆 We record this as our champion!`,
        code:`max = ${max} // new record! subarray [${maxStart}..${maxEnd}]`,
        phase:'newmax',
      });
    }
  }
  frames.push({
    type:'kadane', arr, cur, max, i:arr.length-1, wStart:maxStart, wEnd:maxEnd, maxStart, maxEnd,
    title:`🎊 Answer: ${max}`,
    story:`The maximum subarray is [${arr.slice(maxStart,maxEnd+1).join(', ')}] = ${max} 🎊 Kadane's algorithm found it in just ONE pass through the array!`,
    code:`return ${max}`,
    phase:'done',
  });
  return frames;
}

function genDP(n) {
  const frames = [];
  const dp = Array(n+1).fill(0);
  dp[0]=1; dp[1]=1;
  frames.push({
    type:'dp', dp:[...dp], n, i:1, highlight:[0,1],
    title:'🪜 Climbing Stairs — DP Magic!',
    story:`Think of it like LEGO 🧱. To reach step N, you either came from step N-1 (took 1 step) OR from step N-2 (took 2 steps). So ways[N] = ways[N-1] + ways[N-2]. It's Fibonacci!`,
    code:`dp[0]=1, dp[1]=1 // 1 way each for step 0 and 1`,
    phase:'start',
  });
  for (let i=2; i<=n; i++) {
    dp[i]=dp[i-1]+dp[i-2];
    frames.push({
      type:'dp', dp:[...dp], n, i, highlight:[i],
      title:`🧱 Step ${i}: dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`,
      story:`To reach step ${i}, I can come from step ${i-1} (${dp[i-1]} ways) or step ${i-2} (${dp[i-2]} ways). Total = ${dp[i]} ways! We build on what we already know 🧠`,
      code:`dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`,
      phase: i===n ? 'done' : 'build',
    });
  }
  return frames;
}

function genLinkedListReverse(arr) {
  const frames = [];
  frames.push({
    type:'linkedlist', arr, prev:-1, curr:0, nextIdx:1,
    title:'🔗 Reverse Linked List — Flip the Arrows!',
    story:`Imagine a train 🚂 where each car points to the NEXT one. We want to make each car point to the PREVIOUS one instead. We use 3 pointers: prev 🟣, curr 🔵, next 🟡`,
    code:`let prev = null, curr = head`,
    phase:'start',
  });
  for (let i=0; i<arr.length; i++) {
    const nextIdx = i+1<arr.length ? i+1 : -1;
    frames.push({
      type:'linkedlist', arr, prev:i-1, curr:i, nextIdx,
      title:`🔄 Reversing arrow at node ${arr[i]}`,
      story:`curr = ${arr[i]} 🔵. Save next = ${nextIdx>=0?arr[nextIdx]:'null'} 🟡 (we'll need it!). Now flip the arrow: instead of pointing FORWARD to ${nextIdx>=0?arr[nextIdx]:'null'}, point BACKWARD to ${i>0?arr[i-1]:'null'} 🟣`,
      code:`next = curr.next; curr.next = prev; prev = curr; curr = next`,
      phase:'reverse',
    });
  }
  frames.push({
    type:'linkedlist', arr:[...arr].reverse(), prev:arr.length-1, curr:-1, nextIdx:-1,
    title:`🎊 Reversed! [${[...arr].reverse().join(' → ')}]`,
    story:`All arrows flipped! The list now goes ${[...arr].reverse().join(' → ')}. The new head is ${arr[arr.length-1]} 🎊`,
    code:`return prev // new head = ${arr[arr.length-1]}`,
    phase:'done',
  });
  return frames;
}

function genSlidingWindow(s) {
  const chars = s.split('');
  const frames = [];
  const set = new Set();
  let l=0, max=0;
  frames.push({
    type:'sliding', chars, l:0, r:0, set:new Set(), max:0,
    title:'🪟 Sliding Window — Expanding & Shrinking!',
    story:`Think of a window 🪟 on a train. We expand it RIGHT to include new characters. When we see a DUPLICATE, we shrink from the LEFT to remove it. We track the largest valid window!`,
    code:`const set = new Set(); let l=0, max=0`,
    phase:'start',
  });
  for (let r=0; r<chars.length; r++) {
    while (set.has(chars[r])) {
      set.delete(chars[l]);
      frames.push({
        type:'sliding', chars, l, r, set:new Set(set), max,
        title:`🗑️ Duplicate '${chars[r]}' found! Shrinking from left`,
        story:`'${chars[r]}' is already in our window 😬. We shrink from the LEFT — remove '${chars[l]}' and move l to ${l+1}. Keep shrinking until no duplicate!`,
        code:`set.delete(s[${l}]); l++ // remove from left`,
        phase:'shrink',
      });
      l++;
    }
    set.add(chars[r]);
    const newMax = r-l+1>max;
    if (newMax) max=r-l+1;
    frames.push({
      type:'sliding', chars, l, r, set:new Set(set), max,
      title: newMax ? `🏆 New record! Window "${chars.slice(l,r+1).join('')}" = ${max} chars` : `✅ Added '${chars[r]}' — window "${chars.slice(l,r+1).join('')}"`,
      story: newMax
        ? `The window "${chars.slice(l,r+1).join('')}" is our longest so far with ${max} unique characters! 🏆`
        : `'${chars[r]}' is new and unique ✅. Window expands to "${chars.slice(l,r+1).join('')}" (${r-l+1} chars). Max stays ${max}.`,
      code:`set.add('${chars[r]}'); max = max(max, ${r}-${l}+1) = ${max}`,
      phase: newMax ? 'newmax' : 'expand',
    });
  }
  frames.push({
    type:'sliding', chars, l, r:chars.length-1, set:new Set(set), max,
    title:`🎊 Answer: ${max} characters`,
    story:`The longest substring without repeating characters has ${max} characters! We did it with just ONE pass and a sliding window 🪟`,
    code:`return ${max}`,
    phase:'done',
  });
  return frames;
}

/* ═══════════════════════════════════════════════════════════════════
   RENDERERS — each frame type has its own visual
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  blue:'#58a6ff', purple:'#bc8cff', green:'#3fb950', yellow:'#e3b341',
  red:'#f85149', orange:'#ffa657', gray:'#8b949e', white:'#e6edf3',
  bgBlue:'#1f3a6e', bgPurple:'#2d1b69', bgGreen:'#0d4429', bgYellow:'#341a00',
  bgRed:'#3d0000', bg2:'#161b22', bg3:'#1c2128', bg4:'#21262d',
  border:'#30363d',
};

function ArrayBox({ v, idx, state, showIdx=true }) {
  // state: 'highlight'|'found'|'comparing'|'sorted'|'window'|'left'|'right'|'mid'|'normal'
  const styles = {
    highlight: { bg:C.bgBlue,    border:`2px solid ${C.blue}`,   color:C.blue,   emoji:'👆' },
    found:     { bg:C.bgGreen,   border:`2px solid ${C.green}`,  color:C.green,  emoji:'🎯' },
    comparing: { bg:C.bgYellow,  border:`2px solid ${C.yellow}`, color:C.yellow, emoji:'👀' },
    sorted:    { bg:C.bgGreen,   border:`2px solid ${C.green}`,  color:C.green,  emoji:'✅' },
    window:    { bg:'#162a40',   border:`2px solid ${C.blue}`,   color:C.white,  emoji:''   },
    left:      { bg:C.bgBlue,    border:`2px solid ${C.blue}`,   color:C.blue,   emoji:'L'  },
    right:     { bg:C.bgBlue,    border:`2px solid ${C.blue}`,   color:C.blue,   emoji:'R'  },
    mid:       { bg:C.bgPurple,  border:`2px solid ${C.purple}`, color:C.purple, emoji:'M'  },
    prev:      { bg:C.bgPurple,  border:`2px solid ${C.purple}`, color:C.purple, emoji:'prev'},
    curr:      { bg:C.bgBlue,    border:`2px solid ${C.blue}`,   color:C.blue,   emoji:'curr'},
    next:      { bg:C.bgYellow,  border:`2px solid ${C.yellow}`, color:C.yellow, emoji:'next'},
    done:      { bg:C.bgGreen,   border:`2px solid ${C.green}`,  color:C.green,  emoji:'🏆' },
    normal:    { bg:C.bg4,       border:`1px solid ${C.border}`, color:C.gray,   emoji:''   },
  };
  const st = styles[state] || styles.normal;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
      {showIdx && <span style={{ fontSize:8, color:C.gray, fontFamily:'monospace' }}>{idx}</span>}
      <div style={{ minWidth:40, height:40, borderRadius:8, background:st.bg, border:st.border,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'monospace', fontSize:14, fontWeight:700, color:st.color,
        transition:'all .35s', boxShadow: state!=='normal'?`0 0 12px ${st.border}44`:'' }}>
        {v}
      </div>
      {st.emoji && <span style={{ fontSize:9, color:st.color, fontWeight:700 }}>{st.emoji}</span>}
    </div>
  );
}

function BarChart({ values, highlight=[], sorted=[], window=null, comparing=[] }) {
  const max = Math.max(...values.map(Math.abs), 1);
  return (
    <div style={{ display:'flex', gap:5, alignItems:'flex-end', height:110, paddingTop:20 }}>
      {values.map((v,i) => {
        const h = Math.max(8, (Math.abs(v)/max)*88);
        const isSorted = sorted.includes(i);
        const isHL = highlight.includes(i);
        const inWin = window && i>=window[0] && i<=window[1];
        const isCmp = comparing.includes(i);
        const bg = isSorted ? C.green : isCmp ? C.yellow : isHL ? C.blue : inWin ? '#1a4a8a' : '#1f6feb';
        const glow = (isSorted||isCmp||isHL) ? `0 0 10px ${bg}88` : 'none';
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
            <span style={{ fontSize:9, color:isSorted?C.green:isHL?C.blue:isCmp?C.yellow:C.gray, marginBottom:3, fontWeight:700 }}>{v}</span>
            <div style={{ width:'100%', height:h, background:bg, borderRadius:'4px 4px 0 0', transition:'all .4s', boxShadow:glow }}/>
            <span style={{ fontSize:8, color:'#444c56', marginTop:2 }}>{i}</span>
          </div>
        );
      })}
    </div>
  );
}

function MapDisplay({ map }) {
  const entries = Object.entries(map);
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ fontSize:11, color:C.gray, marginBottom:6, fontWeight:600 }}>📓 Magic Notebook (Hash Map)</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, minHeight:32 }}>
        {entries.length===0
          ? <span style={{ fontSize:12, color:'#444c56', fontStyle:'italic' }}>empty…</span>
          : entries.map(([k,v]) => (
            <div key={k} style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8,
              padding:'5px 12px', fontSize:12, fontFamily:'monospace', display:'flex', gap:6, alignItems:'center' }}>
              <span style={{ color:C.yellow, fontWeight:700 }}>{k}</span>
              <span style={{ color:C.gray }}>→</span>
              <span style={{ color:C.blue, fontWeight:700 }}>idx {v}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function TwoSumFrame({ frame }) {
  const { arr, map, i, need, highlight, found } = frame;
  return (
    <div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {arr.map((v,idx) => {
          const state = found.includes(idx) ? 'found' : highlight.includes(idx) ? 'highlight' : 'normal';
          return <ArrayBox key={idx} v={v} idx={idx} state={state} />;
        })}
      </div>
      {need !== undefined && (
        <div style={{ marginTop:10, background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 14px', fontSize:12, fontFamily:'monospace' }}>
          <span style={{ color:C.gray }}>Looking for </span>
          <span style={{ color:C.yellow, fontWeight:700, fontSize:14 }}>{need}</span>
          <span style={{ color:C.gray }}> in notebook… </span>
          {map[need]!==undefined
            ? <span style={{ color:C.green, fontWeight:700 }}>✅ FOUND at index {map[need]}!</span>
            : <span style={{ color:C.red }}>❌ not found yet</span>
          }
        </div>
      )}
      <MapDisplay map={map} />
    </div>
  );
}

function BSearchFrame({ frame }) {
  const { arr, l, r, m, target, resultIdx } = frame;
  return (
    <div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {arr.map((v,i) => {
          const inRange = i>=l && i<=r;
          const state = resultIdx===i ? 'found' : i===m ? 'mid' : i===l&&inRange ? 'left' : i===r&&inRange ? 'right' : inRange ? 'window' : 'normal';
          return <ArrayBox key={i} v={v} idx={i} state={state} />;
        })}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
        {[['🔵 Left (L)',l,C.blue],['🟣 Mid (M)',m!==null?m:'—',C.purple],['🔵 Right (R)',r,C.blue],['🎯 Target',target,C.yellow]].map(([lbl,val,col])=>(
          <div key={lbl} style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 12px' }}>
            <div style={{ fontSize:10, color:C.gray, marginBottom:2 }}>{lbl}</div>
            <div style={{ fontSize:16, fontWeight:700, color:col, fontFamily:'monospace' }}>{val}</div>
          </div>
        ))}
      </div>
      {/* Visual range indicator */}
      <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:2 }}>
        <span style={{ fontSize:10, color:C.gray, marginRight:4 }}>Search zone:</span>
        {arr.map((_,i) => (
          <div key={i} style={{ width:20, height:8, borderRadius:2,
            background: i>=l&&i<=r ? C.blue : '#21262d',
            transition:'all .4s',
          }}/>
        ))}
      </div>
    </div>
  );
}

function SortFrame({ frame }) {
  const { arr, comparing, sorted } = frame;
  return (
    <div>
      <BarChart values={arr} comparing={comparing} sorted={sorted} />
      <div style={{ display:'flex', gap:5, marginTop:8, flexWrap:'wrap' }}>
        {arr.map((v,i) => {
          const state = sorted.includes(i) ? 'sorted' : comparing.includes(i) ? 'comparing' : 'normal';
          return <ArrayBox key={i} v={v} idx={i} state={state} />;
        })}
      </div>
    </div>
  );
}

function KadaneFrame({ frame }) {
  const { arr, cur, max, i, wStart, wEnd, maxStart, maxEnd, newMax } = frame;
  return (
    <div>
      <BarChart values={arr} highlight={[i]} window={[wStart,wEnd]} />
      <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
        {[
          ['📍 Index', i, C.blue],
          ['🪟 Current Sum', cur, newMax?C.green:C.yellow],
          ['🏆 Max Sum', max, C.green],
        ].map(([lbl,val,col])=>(
          <div key={lbl} style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 12px', flex:1, textAlign:'center' }}>
            <div style={{ fontSize:10, color:C.gray, marginBottom:3 }}>{lbl}</div>
            <div style={{ fontSize:18, fontWeight:800, color:col, fontFamily:'monospace' }}>{val}</div>
          </div>
        ))}
      </div>
      {maxStart!==undefined && (
        <div style={{ marginTop:8, background:C.bgGreen, border:`1px solid ${C.green}`, borderRadius:8, padding:'8px 14px', fontSize:12, fontFamily:'monospace' }}>
          <span style={{ color:C.gray }}>🏆 Best subarray so far: </span>
          <span style={{ color:C.green, fontWeight:700 }}>[{arr.slice(maxStart,maxEnd+1).join(', ')}] = {max}</span>
        </div>
      )}
      <div style={{ marginTop:6, display:'flex', gap:3, alignItems:'center' }}>
        <span style={{ fontSize:10, color:C.gray }}>Current window: </span>
        {arr.map((v,idx)=>(
          <div key={idx} style={{ width:22,height:8,borderRadius:2,background:idx>=wStart&&idx<=wEnd?C.yellow:'#21262d',transition:'all .4s' }}/>
        ))}
      </div>
    </div>
  );
}

function DPFrame({ frame }) {
  const { dp, n, i, highlight } = frame;
  const maxV = Math.max(...dp.filter(x=>x>0), 1);
  return (
    <div>
      {/* Staircase visual */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:90, marginBottom:10 }}>
        {dp.slice(0,n+1).map((v,idx)=>(
          <div key={idx} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
            {v>0 && <span style={{ fontSize:9, color:highlight?.includes(idx)?C.purple:C.gray, marginBottom:2, fontWeight:700 }}>{v}</span>}
            <div style={{ width:'100%', height:Math.max(4,(v/maxV)*72),
              background:highlight?.includes(idx)?C.purple:v>0?C.blue:'#21262d',
              borderRadius:'4px 4px 0 0', transition:'all .4s',
              boxShadow:highlight?.includes(idx)?`0 0 12px ${C.purple}88`:'' }}/>
            <span style={{ fontSize:8, color:'#444c56', marginTop:2 }}>{idx}</span>
          </div>
        ))}
      </div>
      {/* DP cells */}
      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
        {dp.slice(0,n+1).map((v,idx)=>(
          <div key={idx} style={{
            background:highlight?.includes(idx)?C.bgPurple:C.bg4,
            border:`1px solid ${highlight?.includes(idx)?C.purple:C.border}`,
            borderRadius:8, padding:'6px 10px', textAlign:'center', minWidth:50, transition:'all .4s',
            boxShadow:highlight?.includes(idx)?`0 0 10px ${C.purple}66`:'',
          }}>
            <div style={{ fontSize:9, color:C.gray, fontFamily:'monospace' }}>step {idx}</div>
            <div style={{ fontSize:16, fontWeight:700, color:highlight?.includes(idx)?C.purple:v>0?C.white:'#444c56', fontFamily:'monospace' }}>{v||'·'}</div>
          </div>
        ))}
      </div>
      {i>=2 && (
        <div style={{ marginTop:8, fontSize:11, color:C.gray, fontFamily:'monospace' }}>
          dp[{i}] = dp[{i-1}]({dp[i-1]}) + dp[{i-2}]({dp[Math.max(0,i-2)]}) = <span style={{ color:C.purple, fontWeight:700 }}>{dp[i]}</span>
        </div>
      )}
    </div>
  );
}

function LinkedListFrame({ frame }) {
  const { arr, prev, curr, nextIdx } = frame;
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', gap:2, overflowX:'auto', padding:'8px 0', flexWrap:'wrap', rowGap:8 }}>
        {arr.map((v,i)=>{
          const state = i===curr?'curr':i===prev&&prev>=0?'prev':i===nextIdx&&nextIdx>=0?'next':'normal';
          return (
            <React.Fragment key={i}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <ArrayBox v={v} idx={i} state={state} showIdx={false} />
              </div>
              {i<arr.length-1 && (
                <div style={{ color:'#444c56', fontSize:20, padding:'10px 2px', alignSelf:'flex-start', marginTop:8 }}>→</div>
              )}
            </React.Fragment>
          );
        })}
        <div style={{ color:'#444c56', fontSize:14, padding:'14px 4px', alignSelf:'flex-start' }}>→ null</div>
      </div>
      <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
        {[['🟣 prev', prev>=0?arr[prev]:'null', C.purple], ['🔵 curr', curr>=0?arr[curr]:'null', C.blue], ['🟡 next', nextIdx>=0?arr[nextIdx]:'null', C.yellow]].map(([lbl,val,col])=>(
          <div key={lbl} style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 12px', fontSize:12, fontFamily:'monospace' }}>
            <span style={{ color:C.gray }}>{lbl}: </span><span style={{ color:col, fontWeight:700 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidingFrame({ frame }) {
  const { chars, l, r, set, max } = frame;
  return (
    <div>
      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
        {chars.map((c,i)=>{
          const inWin = i>=l && i<=r;
          const isL = i===l, isR = i===r;
          const state = isL||isR ? (isL?'left':'right') : inWin ? 'window' : 'normal';
          return <ArrayBox key={i} v={c} idx={i} state={state} />;
        })}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
        <div style={{ background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 14px', flex:2 }}>
          <div style={{ fontSize:10, color:C.gray, marginBottom:3 }}>🪟 Current Window</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.blue, fontFamily:'monospace' }}>"{chars.slice(l,r+1).join('')}"</div>
        </div>
        <div style={{ background:C.bgGreen, border:`1px solid ${C.green}`, borderRadius:8, padding:'6px 14px', flex:1, textAlign:'center' }}>
          <div style={{ fontSize:10, color:C.gray, marginBottom:3 }}>🏆 Max Length</div>
          <div style={{ fontSize:20, fontWeight:800, color:C.green, fontFamily:'monospace' }}>{max}</div>
        </div>
      </div>
      <div style={{ marginTop:8, display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:10, color:C.gray }}>Set: </span>
        {[...set].map(c => (
          <span key={c} style={{ background:C.bg4, border:`1px solid ${C.border}`, borderRadius:6, padding:'3px 10px', fontSize:13, fontFamily:'monospace', color:C.white }}>{c}</span>
        ))}
        {set.size===0 && <span style={{ fontSize:11, color:'#444c56', fontStyle:'italic' }}>empty</span>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FRAME SELECTOR — maps question ID to generator + renderer
   ═══════════════════════════════════════════════════════════════════ */
function getFrames(q) {
  const d = q.vizData || [];
  switch(q.id) {
    case 1:  return genTwoSum(d.length?d:[2,7,11,15], 9);
    case 2:  return genKadane([7,1,5,3,6,4]);
    case 3:  return genBubbleSort(d.length?d:[1,2,3,1]);
    case 4:  return genBubbleSort([3,6,2,8,1,7]);
    case 5:  return genSlidingWindow('abcabcbb');
    case 8:  return genDP(6);
    case 9:  return genKadane([1,5,10,4,3]);
    case 10: return genBinarySearch(d.length?d:[-1,0,3,5,9,12], 9);
    case 11: return genKadane(d.length?d:[-2,1,-3,4,-1,2,1,-5,4]);
    case 12: return genSlidingWindow('abcabcbb');
    case 14: return genLinkedListReverse([1,2,3,4,5]);
    default:
      if(d.length) return genBubbleSort(d);
      return genBubbleSort([5,3,8,1,9,2,7,4]);
  }
}

function renderFrame(q, frame) {
  if (!frame) return null;
  switch(frame.type) {
    case 'twosum':     return <TwoSumFrame frame={frame} />;
    case 'bsearch':    return <BSearchFrame frame={frame} />;
    case 'sort':       return <SortFrame frame={frame} />;
    case 'kadane':     return <KadaneFrame frame={frame} />;
    case 'dp':         return <DPFrame frame={frame} />;
    case 'linkedlist': return <LinkedListFrame frame={frame} />;
    case 'sliding':    return <SlidingFrame frame={frame} />;
    default:           return <SortFrame frame={frame} />;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════ */
export default function AlgoVisualizer({ question, compact=false }) {
  const [step, setStep]     = useState(0);
  const [playing, setPlay]  = useState(false);
  const [speed, setSpeed]   = useState(1000);
  const timerRef            = useRef(null);

  const frames   = question ? getFrames(question) : [];
  const maxSteps = frames.length || 1;
  const frame    = frames[Math.min(step, maxSteps-1)] || {};

  const tick = useCallback(() => {
    setStep(s => { if(s+1>=maxSteps){setPlay(false);return s;} return s+1; });
  }, [maxSteps]);

  useEffect(() => {
    if (playing) timerRef.current = setInterval(tick, speed);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing, tick, speed]);

  useEffect(() => { setStep(0); setPlay(false); }, [question?.id]);

  if (!question) return <div style={{ color:C.gray, padding:16 }}>Select a question.</div>;
  if (!frames.length) return <div style={{ color:C.gray, padding:16 }}>Visualization coming soon!</div>;

  const phaseColor = { start:C.blue, check:C.yellow, done:C.green, store:C.purple, pass:C.blue, newmax:C.green, done:C.green, reverse:C.yellow, build:C.purple, expand:C.blue, shrink:C.red, swap:C.yellow }[frame.phase] || C.gray;

  return (
    <div>
      {/* Title & story card */}
      <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, padding:14, marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.white, flex:1 }}>{frame.title}</div>
          <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0, marginLeft:8 }}>
            {frame.phase==='done' && <span style={{ fontSize:10, fontWeight:700, color:C.green, background:C.bgGreen, padding:'2px 8px', borderRadius:20 }}>DONE ✓</span>}
            <span style={{ fontSize:11, color:C.gray, fontFamily:'monospace' }}>{step+1}/{maxSteps}</span>
          </div>
        </div>
        <div style={{ fontSize:12, color:'#c9d1d9', lineHeight:1.7, marginBottom:10 }}>{frame.story}</div>

        {/* Visualization canvas */}
        <div style={{ background:'#0d1117', border:`1px solid ${C.border}`, borderRadius:8, padding:14 }}>
          {renderFrame(question, frame)}
        </div>
      </div>

      {/* Code line */}
      {frame.code && (
        <div style={{ background:'#0d1117', border:`1px solid ${phaseColor}44`, borderRadius:8, padding:'8px 14px', marginBottom:10, display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:phaseColor,flexShrink:0 }}/>
          <code style={{ fontSize:12, color:phaseColor, fontFamily:"'JetBrains Mono',monospace", flex:1 }}>{frame.code}</code>
        </div>
      )}

      {/* Controls */}
      <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={()=>{setStep(0);setPlay(false);}} style={btnSt}>↺ Reset</button>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} style={btnSt}>◀ Prev</button>
        <button onClick={()=>setPlay(p=>!p)} style={{ ...btnSt,
          background:playing?C.bgRed:C.bgGreen, color:playing?C.red:C.green,
          border:`1px solid ${playing?C.red:C.green}`, minWidth:80, fontWeight:700 }}>
          {playing?'⏸ Pause':'▶ Play'}
        </button>
        <button onClick={()=>setStep(s=>Math.min(maxSteps-1,s+1))} style={btnSt}>Next ▶</button>
        <div style={{ flex:1, height:6, background:'#21262d', borderRadius:6, overflow:'hidden', minWidth:60 }}>
          <div style={{ height:'100%', width:`${((step+1)/maxSteps)*100}%`, background:C.blue, borderRadius:6, transition:'width .3s' }}/>
        </div>
        {!compact && (
          <select value={speed} onChange={e=>setSpeed(Number(e.target.value))}
            style={{ background:C.bg3, border:`1px solid ${C.border}`, color:C.gray, fontSize:11, padding:'4px 8px', borderRadius:6, cursor:'pointer', outline:'none' }}>
            <option value={2000}>🐢 Slow</option>
            <option value={1000}>🚶 Normal</option>
            <option value={400}>🏃 Fast</option>
            <option value={100}>🚀 Turbo</option>
          </select>
        )}
      </div>

      {/* Algorithm steps tracker */}
      {!compact && question.algoSteps && (
        <div style={{ marginTop:12, background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, padding:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.gray, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>📋 ALGORITHM STEPS</div>
          {question.algoSteps.map((st, idx) => {
            const progress = Math.floor((step/maxSteps)*question.algoSteps.length);
            const isActive = idx === progress;
            const isDone   = idx < progress;
            return (
              <div key={idx} style={{ display:'flex', gap:10, padding:'5px 0', alignItems:'flex-start' }}>
                <div style={{ width:22,height:22,borderRadius:'50%',flexShrink:0,
                  background:isDone?C.bgGreen:isActive?C.bgBlue:C.bg4,
                  border:`2px solid ${isDone?C.green:isActive?C.blue:'#444c56'}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:isDone?11:10, fontWeight:700,
                  color:isDone?C.green:isActive?C.blue:C.gray,
                  transition:'all .3s',
                }}>{isDone?'✓':idx+1}</div>
                <div style={{ fontSize:12, fontFamily:'monospace', lineHeight:1.7, paddingTop:2,
                  color:isActive?C.white:isDone?C.gray:'#444c56',
                  fontWeight:isActive?600:400, transition:'all .3s' }}>{st}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const btnSt = {
  padding:'6px 12px', borderRadius:6, fontSize:12, cursor:'pointer',
  border:`1px solid ${C.border}`, background:C.bg4, color:C.gray,
  fontFamily:'inherit', transition:'all .15s',
};
