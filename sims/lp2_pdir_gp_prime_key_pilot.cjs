#!/usr/bin/env node
/*
 * Small independent pilot for the 2016 clue "their numbers are the direction".
 * It tests a source-authenticated key family (prime/totient-related streams)
 * under word-wise key-pointer direction, rather than additive fixed positions.
 *
 * Scope intentionally bounded:
 *   sections 0.7 and 0.8, first 300 runes;
 *   G4_prev, GP_prev, G2_cur, G4_cur, GP_cur;
 *   conventions 000,100,020,120,010,110;
 *   forward/reverse direction, key multipliers +/-1, both collision models;
 *   key offsets 400..4800 step 400;
 *   beam width 8.
 *
 * This is a pilot, not the full 581-stream/18-convention campaign.
 */

const fs = require("fs");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const transcription = fs.readFileSync("resources/liber-primus/lp2-transcription.txt", "utf8");
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const PRIME = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];

function parseSection(s) {
  const words = [];
  let cur = [];
  for (const ch of s) {
    if (runeMap.has(ch)) cur.push(runeMap.get(ch));
    else if (ch === "-" || ch === "." || ch === "&") {
      if (cur.length) { words.push(cur); cur = []; }
    }
  }
  if (cur.length) words.push(cur);
  return { words, runes: words.flat() };
}

const sections = transcription.split("$").slice(0, 2).map(parseSection);
if (sections[0].runes.length !== 729 || sections[1].runes.length !== 1145) {
  throw new Error("section counts do not match canonical 0.7/0.8 lengths");
}

function isPrime(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

function ruleVector(sec, name, n = 300) {
  const G = sec.words.map(w => w.reduce((s, x) => s + PRIME[x], 0));
  const out = [];
  let wi = 0, base = 0;
  for (let i = 0; i < n; i++) {
    while (wi < sec.words.length && i >= base + sec.words[wi].length) {
      base += sec.words[wi].length;
      wi++;
    }
    const g = name.includes("prev") ? (wi ? G[wi - 1] : null) : G[wi];
    if (g == null) out.push(1);
    else if (name === "G4_prev" || name === "G4_cur") out.push(g % 4 <= 1 ? 1 : -1);
    else if (name === "G2_cur") out.push(g % 2 === 0 ? 1 : -1);
    else out.push(isPrime(g) ? 1 : -1);
  }
  return out;
}

function plan(sec, rule, conv, reverse, n = 300) {
  const [h, m, c] = conv.split("").map(Number);
  const flip = reverse ? -1 : 1;
  const dirs = [], mv = [], pv = [];
  let pos = 0, old = null, lastBack = -1;
  for (const w of sec.words) {
    const d = rule[pos] * flip;
    const move = (old === null ? 0 : (m === 0 ? 0 : (m === 1 ? old : d))) +
                 (d < 0 && h === 1 ? -1 : 0);
    for (let i = 0; i < w.length && pos + i < n; i++) {
      const j = pos + i;
      dirs[j] = d;
      mv[j] = i === 0 ? move : 0;
      const before = j === 0 ? -1 : sec.runes[j - 1];
      pv[j] = d > 0 || c === 0 ? before :
              c === 1 ? (i === 0 ? -1 : before) : lastBack;
      if (d < 0) lastBack = sec.runes[j];
    }
    old = d;
    pos += w.length;
    if (pos >= n) break;
  }
  return { dirs, mv, pv };
}

function decode(ct, key, start, P, model, beam = 8) {
  const n = ct.length;
  let cur = [{ j: start, score: 0, counts: Array(29).fill(0) }];
  for (let i = 0; i < n; i++) {
    for (const st of cur) st.j += P.mv[i];
    const states = cur.filter(st => {
      const j2 = st.j + 2 * P.dirs[i];
      return st.j >= 0 && j2 >= 0 && j2 < key.length;
    });
    const extra = [];

    for (const st of states) {
      const j = st.j, d = P.dirs[i], prev = P.pv[i];
      const k0 = key[j], k1 = key[j + d], k2 = key[j + 2 * d];
      const t0 = (ct[i] - k0 + 29) % 29;

      const take = (s, t, nj) => {
        s.score += 2 * s.counts[t];
        s.counts[t]++;
        s.j = nj;
      };

      if (prev >= 0) {
        const t1 = (ct[i] - k1 + 29) % 29;
        const t2 = (ct[i] - k2 + 29) % 29;

        if (model === 0 && (t1 + k0) % 29 === prev && j + 2 * d >= 0) {
          const s = { j, score: st.score, counts: st.counts.slice() };
          take(s, t1, j + 2 * d);
          extra.push(s);
        }
        if (model === 0 && (t2 + k0) % 29 === prev &&
            (t2 + k1) % 29 === prev && j + 3 * d >= 0) {
          const s = { j, score: st.score, counts: st.counts.slice() };
          take(s, t2, j + 3 * d);
          extra.push(s);
        }
        if (model === 1 && (t2 + k0) % 29 === prev && j + 3 * d >= 0) {
          const s = { j, score: st.score, counts: st.counts.slice() };
          take(s, t2, j + 3 * d);
          extra.push(s);
        }
      }

      const nj = (model === 1 && prev === ct[i]) ? j + 2 * d : j + d;
      if (nj >= 0 && nj < key.length) take(st, t0, nj);
      else st.dead = true;
    }

    const merged = new Map();
    for (const st of states.filter(s => !s.dead).concat(extra)) {
      const old = merged.get(st.j);
      if (!old || st.score > old.score) merged.set(st.j, st);
    }
    cur = [...merged.values()].sort((a, b) => b.score - a.score).slice(0, beam);
    if (!cur.length) return 0;
  }
  return Math.max(...cur.map(s => s.score)) / (n * (n - 1));
}

function sieve(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let ok = true;
    for (const p of out) {
      if (p * p > x) break;
      if (x % p === 0) { ok = false; break; }
    }
    if (ok) out.push(x);
  }
  return out;
}

const primes = sieve(30000);
const fib = [0, 1];
while (fib.length < 30000) fib.push((fib.at(-1) + fib.at(-2)) % 1000000000);
const phi = Array.from({length: 30002}, (_, i) => i);
for (let i = 2; i < phi.length; i++) if (phi[i] === i)
  for (let j = i; j < phi.length; j += i) phi[j] -= phi[j] / i;

const streams = {
  "primes-1": primes.map(p => p - 1),
  "phi(n)": phi.slice(1),
  "n": Array.from({length: 30000}, (_, i) => i + 1),
  "n2": Array.from({length: 30000}, (_, i) => (i + 1) ** 2),
  "fibonacci": fib,
  "prime-gaps": primes.slice(1).map((p, i) => p - primes[i])
};

const rules = ["G4_prev", "GP_prev", "G2_cur", "G4_cur", "GP_cur"];
const conventions = ["000", "100", "020", "120", "010", "110"];
const offsets = Array.from({length: 12}, (_, i) => 400 + i * 400);
const results = [];

for (const [name, raw] of Object.entries(streams)) {
  const base = raw.map(x => ((x % 29) + 29) % 29);
  let best = { score: 0 };
  for (let si = 0; si < 2; si++) {
    const sec = sections[si], ct = sec.runes.slice(0, 300);
    for (const ruleName of rules) {
      const rv = ruleVector(sec, ruleName);
      for (const conv of conventions) {
        for (const reverse of [false, true]) {
          for (const mult of [1, 28]) {
            const key = base.map(x => x * mult % 29);
            for (const model of [0, 1]) {
              const P = plan(sec, rv, conv, reverse);
              for (const off of offsets) {
                const score = decode(ct, key, off, P, model, 8);
                if (score > best.score)
                  best = { score, section: si + 7, rule: ruleName, conv,
                           reverse, mult, model, offset: off };
              }
            }
          }
        }
      }
    }
  }
  results.push({ stream: name, best });
}

console.log(JSON.stringify({
  baselineIoC: 1 / 29,
  gate: 0.045,
  scope: { sections: ["0.7", "0.8"], runes: 300, rules, conventions, offsets,
            orientations: 2, multipliers: 2, collisionModels: 2, beam: 8 },
  results
}, null, 2));
