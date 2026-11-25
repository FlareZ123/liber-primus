"use strict";
/*
 * #2684: unknown shared q8 key with independent latent start phase per
 * post-encryption-shuffled printed group. Exact GP29 additive + literal-F hold.
 * Controls run before the original chapter is opened by this script.
 */
const fs = require("node:fs");
const path = require("node:path");
const Q = 29, T = 8, MAX_WORD = 24, OOV_RATE = 0.05;
const INPUTS = [
  "resources/liber-primus/lp2-corpus.json",
  "resources/lp2-transcription.txt",
  "resources/transcriptions/lp1_wulfic_canonical.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const mod = x => ((x % Q) + Q) % Q;
const idOf = w => String.fromCharCode(...w.map(x => 65 + x));
const wordOf = id => Array.from(id, x => x.charCodeAt(0) - 65);
function rng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
}
function shuffle(a, R) {
  const out = a.slice();
  for (let j = out.length - 1; j > 0; j--) {
    const i = Math.floor(R() * (j + 1));
    [out[j], out[i]] = [out[i], out[j]];
  }
  return out;
}
function compare(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}
function canonical(K) {
  let best = null, offset = 0;
  for (let s = 0; s < T; s++) {
    const r = K.slice(s).concat(K.slice(0, s));
    if (!best || compare(r, best) < 0) { best = r; offset = s; }
  }
  return { id: best.join(","), K: best, offset };
}
function body(t) {
  const a = /\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
  const b = /\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
  return t.slice(a ? a.index + a[0].length : 0, b ? b.index : t.length);
}
function experiment(raw) {
  const gp = JSON.parse(raw[0]), gold = JSON.parse(raw[3]);
  const ix = new Map(gp.runes.map((x, i) => [x, i]));
  const tokens = gp.translit.map((t, i) => ({ t, i })).sort((a, b) => b.t.length - a.t.length);
  function extract(s) { return [...s].filter(x => ix.has(x)).map(x => ix.get(x)); }
  function nativeWords(t) {
    const out = [];
    for (const w of t.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S").match(/[A-Z]+/g) || []) {
      const a = [];
      for (let j = 0; j < w.length;) {
        const q = w.startsWith("ING", j) ? { t: "ING", i: 21 } :
          w.startsWith("IO", j) ? { t: "IO", i: 27 } : tokens.find(x => w.startsWith(x.t, j));
        if (!q) throw new Error("unmapped donor spelling " + w);
        a.push(q.i); j += q.t.length;
      }
      out.push(a);
    }
    return out;
  }
  function runeWords(t, separator) {
    const out = []; let word = [], before = "";
    for (const x of t) {
      if (ix.has(x)) {
        if (word.length && separator.test(before)) { out.push(word); word = []; }
        word.push(ix.get(x)); before = "";
      } else before += x;
    }
    if (word.length) out.push(word);
    return out;
  }
  const donors = raw.slice(4).map(t => nativeWords(body(t)));
  const training = donors.map(w => w.slice(0, Math.floor(w.length * 0.8)));
  for (const s of gold.sections) {
    if (!["0_welcome", "jpg107-167"].includes(s.name))
      training.push(runeWords(s.source_text, /[^\u16a0-\u16ff]/u));
  }
  const counts = new Map();
  for (const ws of training) for (const w of ws) {
    if (w.length > 0 && w.length <= MAX_WORD) {
      const id = idOf(w); counts.set(id, (counts.get(id) || 0) + 1);
    }
  }
  const dictByLen = new Map(), anchorsByLen = new Map();
  for (const [id, n] of counts) {
    const w = wordOf(id), active = w.filter(x => x !== 0).length;
    if (!dictByLen.has(w.length)) dictByLen.set(w.length, new Set());
    dictByLen.get(w.length).add(id);
    if (active >= 9) {
      if (!anchorsByLen.has(w.length)) anchorsByLen.set(w.length, []);
      anchorsByLen.get(w.length).push({ id, w, n, active });
    }
  }
  // Exact source transcription and the preselected largest complete chapter p40–53.
  const source = runeWords(raw[1], /[-.]/u);
  const target = gp.pages.filter(x => x.page >= 40 && x.page <= 53).flatMap(x => x.indices);
  const sourceFlat = source.flat();
  const start = gp.pages.filter(x => x.page < 40).reduce((s, x) => s + x.indices.length, 0);
  const end = start + target.length;
  if (sourceFlat.slice(start, end).join() !== target.join()) throw new Error("source/corpus mismatch");
  let cursor = 0; const plainGroups = [], clipped = [];
  for (const w of source) {
    const a = cursor, b = cursor + w.length;
    if (a < end && b > start) {
      const lo = Math.max(0, start - a), hi = Math.min(w.length, end - a);
      if (lo !== 0 || hi !== w.length) clipped.push({ a, b, lo, hi });
      plainGroups.push(w.slice(lo, hi));
    }
    cursor = b;
  }
  if (clipped.length || plainGroups.flat().length !== target.length || plainGroups.length !== 669)
    throw new Error("chapter group geometry changed: " + JSON.stringify({ clipped: clipped.length, groups: plainGroups.length, runes: plainGroups.flat().length }));
  const inventory = plainGroups.map(w => w.length);
  const originalGroups = []; cursor = 0;
  for (const w of plainGroups) { originalGroups.push(target.slice(cursor, cursor + w.length)); cursor += w.length; }
  const oovBudget = Math.floor(OOV_RATE * inventory.length);
  const coverageThreshold = inventory.length - oovBudget;

  // Genuine solved sections validate the exact additive/F-hold convention.
  const welcome = gold.sections.find(s => s.name === "0_welcome");
  const koan = gold.sections.find(s => s.name === "jpg107-167");
  const welcomeKey = [23, 10, 1, 10, 9, 10, 16, 26];
  const koanKey = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18];
  function encode(P, K, phase) {
    const C = [];
    for (const p of P) {
      if (p === 0) C.push(0);
      else { C.push(mod(p + K[phase])); phase = (phase + 1) % K.length; }
    }
    return C;
  }
  const wC = extract(raw[2].split("%").slice(1, 3).join("%"));
  const kC = extract(raw[2].split("$")[5]);
  if (encode(extract(welcome.source_text), welcomeKey, 0).join() !== wC.join()) throw new Error("WELCOME replay failed");
  if (encode(extract(koan.source_text), koanKey, 0).join() !== kC.join()) throw new Error("KOAN replay failed");

  // Controls are three real contiguous 669-word windows from the held-out
  // final 20% of the three donor texts. Select the first window meeting the
  // source-only <=5% frozen-lexicon OOV cap; no ciphertext or key is consulted.
  const donorNames = ["Gibran", "Shakespeare", "Emerson"];
  const controlWindows = donors.map((donor, donorIndex) => {
    const heldoutStart = Math.floor(donor.length * 0.8), n = inventory.length;
    for (let at = heldoutStart; at + n <= donor.length; at++) {
      const words = donor.slice(at, at + n);
      const oov = words.filter(w => w.length > MAX_WORD || !counts.has(idOf(w))).length;
      const maxLen = Math.max(...words.map(w => w.length));
      if (oov <= oovBudget && maxLen <= MAX_WORD)
        return { donorIndex, donor: donorNames[donorIndex], start: at, end: at + n, oov, maxLen, words };
    }
    throw new Error("no held-out contiguous donor window passes OOV cap for " + donorNames[donorIndex]);
  });
  function makeNativeControl(donorIndex, seed) {
    const R = rng(seed), win = controlWindows[donorIndex], words = win.words;
    const K = Array.from({ length: T }, () => Math.floor(R() * Q));
    let phase = 0;
    const items = words.map((P, originalIndex) => {
      const startPhase = phase, C = encode(P, K, phase);
      const active = P.filter(x => x !== 0).length;
      const endPhase = (startPhase + active) % T;
      phase = endPhase;
      return { C, P: P.slice(), word: idOf(P), originalIndex, startPhase, endPhase };
    });
    const shuffled = shuffle(items, R);
    return { groups: shuffled.map(x => x.C), truth: shuffled, key: canonical(K), rawKey: K,
      originalWords: words.map(w => w.slice()), window: { donor: win.donor, start: win.start, end: win.end, oov: win.oov, maxLen: win.maxLen } };
  }
  function makeNullControl(words, seed) {
    const R = rng(seed);
    const items = words.map((P, originalIndex) => {
      const K = Array.from({ length: T }, () => Math.floor(R() * Q));
      const startPhase = Math.floor(R() * T);
      const C = encode(P, K, startPhase);
      const active = P.filter(x => x !== 0).length;
      return { C, P: P.slice(), word: idOf(P), originalIndex, startPhase, endPhase: (startPhase + active) % T };
    });
    const shuffled = shuffle(items, R);
    return { groups: shuffled.map(x => x.C), truth: shuffled };
  }

  function makeCandidateKeys(cipherGroups) {
    const map = new Map();
    for (let gi = 0; gi < cipherGroups.length; gi++) {
      const C = cipherGroups[gi], anchors = anchorsByLen.get(C.length) || [];
      for (const a of anchors) for (let s = 0; s < T; s++) {
        const K = Array(T).fill(-1); let consumed = 0, ok = true;
        for (let j = 0; j < a.w.length; j++) {
          const p = a.w[j], c = C[j];
          if (p === 0) { if (c !== 0) { ok = false; break; } continue; }
          const slot = (s + consumed) % T, v = mod(c - p);
          if (K[slot] !== -1 && K[slot] !== v) { ok = false; break; }
          K[slot] = v; consumed++;
        }
        if (!ok || K.some(x => x < 0)) continue;
        const canon = canonical(K);
        if (!map.has(canon.id)) map.set(canon.id, { K: canon.K, groups: new Set(), anchors: [] });
        const rec = map.get(canon.id);
        rec.groups.add(gi);
        rec.anchors.push({ group: gi, word: a.id, startPhase: s, active: a.active });
      }
    }
    return map;
  }

  // Exact one-word inverse for a fixed key and any latent group start phase.
  // At ciphertext F, branch between literal plaintext F (hold) and the
  // non-F additive preimage (consume); at non-F, only the consuming branch exists.
  function decodeGroup(C, K, startPhase, dict) {
    const found = new Map(), L = C.length;
    function walk(i, phase, word, consumed, holds) {
      if (i === L) {
        if (dict.has(word)) {
          const id = word + "|" + phase;
          if (!found.has(id)) found.set(id, { word, endPhase: phase, consumed, holds });
        }
        return;
      }
      const c = C[i];
      if (c === 0) {
        walk(i + 1, phase, word + "A", consumed, holds + 1);
        const p = mod(-K[phase]);
        if (p !== 0) walk(i + 1, (phase + 1) % T, word + String.fromCharCode(65 + p), consumed + 1, holds);
      } else {
        const p = mod(c - K[phase]);
        if (p !== 0) walk(i + 1, (phase + 1) % T, word + String.fromCharCode(65 + p), consumed + 1, holds);
      }
    }
    walk(0, startPhase, "", 0, 0);
    return [...found.values()];
  }
  function evaluateKey(cipherGroups, K, collect) {
    let covered = 0, edgeCount = 0, uniqueWordGroups = 0, uniqueEdgeGroups = 0, totalWordOptions = 0;
    const optionsByGroup = collect ? Array(cipherGroups.length) : null;
    const groupOrder = Array.from({ length: cipherGroups.length }, (_, i) => i).sort((a, b) =>
      cipherGroups[b].length - cipherGroups[a].length ||
      cipherGroups[a].filter(x => x === 0).length - cipherGroups[b].filter(x => x === 0).length
    );
    for (const gi of groupOrder) {
      const C = cipherGroups[gi], dict = dictByLen.get(C.length) || new Set(), options = [];
      for (let s = 0; s < T; s++) {
        for (const m of decodeGroup(C, K, s, dict)) options.push({ startPhase: s, endPhase: m.endPhase, word: m.word });
      }
      const words = new Set(options.map(x => x.word));
      const edges = new Set(options.map(x => x.startPhase + ">" + x.endPhase));
      if (options.length) {
        covered++; edgeCount += edges.size; totalWordOptions += words.size;
        if (words.size === 1) uniqueWordGroups++;
        if (edges.size === 1) uniqueEdgeGroups++;
      }
      if (collect) optionsByGroup[gi] = options;
    }
    return { covered, missing: cipherGroups.length - covered, edgeCount, uniqueWordGroups, uniqueEdgeGroups, totalWordOptions, optionsByGroup };
  }
  function runSearch(cipherGroups) {
    const candidates = makeCandidateKeys(cipherGroups), ranked = [];
    for (const [id, rec] of candidates) {
      const e = evaluateKey(cipherGroups, rec.K, false);
      ranked.push({ id, K: rec.K, anchorGroups: [...rec.groups], covered: e.covered, missing: e.missing,
        edgeCount: e.edgeCount, uniqueWordGroups: e.uniqueWordGroups, uniqueEdgeGroups: e.uniqueEdgeGroups,
        totalWordOptions: e.totalWordOptions });
    }
    ranked.sort((a, b) => b.covered - a.covered || a.edgeCount - b.edgeCount || a.id.localeCompare(b.id));
    const passing = ranked.filter(x => x.covered >= coverageThreshold);
    const supportHistogram = {};
    for (const rec of candidates.values()) { const n = rec.groups.size; supportHistogram[n] = (supportHistogram[n] || 0) + 1; }
    const supportValues = [...candidates.values()].map(rec => rec.groups.size);
    const support = { keys: candidates.size, keysWithMultipleGroups: supportValues.filter(n => n >= 2).length,
      maxGroupsPerKey: Math.max(0, ...supportValues), histogram: supportHistogram };
    return { candidates, ranked, passing, support };
  }
  function inspectTrueControl(dataset, search) {
    const trueId = dataset.key.id;
    const trueCandidate = search.ranked.find(x => x.id === trueId);
    const detail = trueCandidate ? evaluateKey(dataset.groups, dataset.key.K, true) : null;
    let trueWordsPresent = 0, trueEdgesPresent = 0, uniqueWordGroups = 0, uniqueEdgeGroups = 0;
    const trueKnownWords = dataset.truth.filter(t => (dictByLen.get(t.P.length) || new Set()).has(t.word)).length;
    const trueOOV = dataset.truth.length - trueKnownWords;
    if (detail) {
      for (let i = 0; i < dataset.truth.length; i++) {
        const t = dataset.truth[i];
        if (!(dictByLen.get(t.P.length) || new Set()).has(t.word)) continue;
        const s = (t.startPhase - dataset.key.offset + T) % T,
          e = (t.endPhase - dataset.key.offset + T) % T;
        const opts = detail.optionsByGroup[i] || [];
        if (opts.some(o => o.word === t.word)) trueWordsPresent++;
        if (opts.some(o => o.word === t.word && o.startPhase === s && o.endPhase === e)) trueEdgesPresent++;
      }
      uniqueWordGroups = detail.uniqueWordGroups;
      uniqueEdgeGroups = detail.uniqueEdgeGroups;
    }
    const passIds = search.passing.map(x => x.id);
    return {
      candidateKeys: search.ranked.length,
      anchorSupport: search.support,
      trueKeyInPool: !!trueCandidate,
      trueKeyCoverage: trueCandidate ? trueCandidate.covered : 0,
      passingKeys: passIds.length,
      onlyTrueKeyPasses: passIds.length === 1 && passIds[0] === trueId,
      trueWordsPresent, trueEdgesPresent, trueKnownWords, trueOOV,
      uniqueWordGroups, uniqueEdgeGroups,
      controlWindow: dataset.window,
      truePhaseTrail: dataset.truth.slice().sort((a, b) => a.originalIndex - b.originalIndex).every((x, i, a) =>
        i === 0 ? x.startPhase === 0 : a[i - 1].endPhase === x.startPhase)
    };
  }
  function summarizeNull(search) {
    return {
      candidateKeys: search.ranked.length,
      anchorSupport: search.support,
      passingKeys: search.passing.length,
      best: search.ranked[0] ? {
        key: search.ranked[0].id, covered: search.ranked[0].covered, missing: search.ranked[0].missing,
        edgeCount: search.ranked[0].edgeCount, anchorGroups: search.ranked[0].anchorGroups
      } : null
    };
  }
  function phaseGraph(detail) {
    const G = detail.optionsByGroup.length, edgeOptions = detail.optionsByGroup.map(opts =>
      [...new Set(opts.map(o => o.startPhase + ">" + o.endPhase))].map(s => s.split(">").map(Number))
    );
    const unique = edgeOptions.every(x => x.length === 1);
    const maxOptions = Math.max(...edgeOptions.map(x => x.length));
    const histogram = edgeOptions.reduce((h, x) => (h[x.length] = (h[x.length] || 0) + 1, h), {});
    if (!unique) return { uniqueEdgeGroups: edgeOptions.filter(x => x.length === 1).length, maxOptionsPerGroup: maxOptions, edgeOptionHistogram: histogram, eulerian: null };
    const edges = edgeOptions.map((x, i) => ({ id: i, from: x[0][0], to: x[0][1] }));
    const indeg = Array(T).fill(0), outdeg = Array(T).fill(0), adj = Array.from({ length: T }, () => []);
    for (const e of edges) { outdeg[e.from]++; indeg[e.to]++; adj[e.from].push(e); }
    const plus = [], minus = [];
    for (let i = 0; i < T; i++) {
      const d = outdeg[i] - indeg[i];
      if (d === 1) plus.push(i); else if (d === -1) minus.push(i); else if (d !== 0) return { uniqueEdgeGroups: G, maxOptionsPerGroup: 1, edgeOptionHistogram: histogram, eulerian: false, degreeFailure: i };
    }
    if (!((plus.length === 1 && minus.length === 1) || (plus.length === 0 && minus.length === 0)))
      return { uniqueEdgeGroups: G, maxOptionsPerGroup: 1, edgeOptionHistogram: histogram, eulerian: false, plus, minus };
    const startNode = plus.length ? plus[0] : edges.length ? edges[0].from : 0;
    const used = new Set(), stack = [startNode], pathEdges = [];
    while (stack.length) {
      const v = stack[stack.length - 1], e = adj[v].find(x => !used.has(x.id));
      if (e) { used.add(e.id); stack.push(e.to); }
      else { stack.pop(); if (stack.length) pathEdges.push(v); }
    }
    return { uniqueEdgeGroups: G, maxOptionsPerGroup: 1, edgeOptionHistogram: histogram,
      eulerian: used.size === G && pathEdges.length === G, startNode, edgeCount: G,
      degreePlus: plus, degreeMinus: minus };
  }

  const nativeControls = [], nullControls = [];
  const controlSeeds = [0x26840111, 0x26840222, 0x26840333];
  for (let i = 0; i < 3; i++) {
    const ds = makeNativeControl(i, controlSeeds[i]);
    const search = runSearch(ds.groups);
    nativeControls.push({ name: "post-encryption-shuffle-" + (i + 1), ...inspectTrueControl(ds, search) });
    const ns = makeNullControl(ds.originalWords, controlSeeds[i] ^ 0x5a5a5a5a);
    const nullSearch = runSearch(ns.groups);
    nullControls.push({ name: "independent-per-group-pad-" + (i + 1), ...summarizeNull(nullSearch) });
  }
  const nativeGate = nativeControls.every(x => x.trueKeyInPool && x.trueKeyCoverage >= coverageThreshold &&
    x.onlyTrueKeyPasses && x.trueOOV <= oovBudget && x.trueWordsPresent === x.trueKnownWords &&
    x.trueEdgesPresent === x.trueKnownWords && x.truePhaseTrail);
  const nullGate = nullControls.every(x => x.passingKeys === 0);
  const gate = nativeGate && nullGate;
  const output = {
    method: {
      target: "LP2 physical p40–53", runes: target.length, groups: inventory.length,
      inventoryHistogram: inventory.reduce((h, n) => (h[n] = (h[n] || 0) + 1, h), {}),
      key: "one unknown shared cyclic additive GP29 q8 key, phase independently latent per intact ciphertext group",
      F: "literal plaintext F emits ciphertext F and does not consume; ciphertext F also branches to a consuming non-F preimage",
      anchors: "frozen #2683 lexicon; at least 9 consuming symbols; all 8 group starts; exact repeated-slot equality",
      dictionaryTypes: counts.size, anchorTypes: [...anchorsByLen.values()].reduce((s, a) => s + a.length, 0),
      maxWordLength: MAX_WORD, oovBudgetGroups: oovBudget, coverageThreshold,
      sourceGroupClips: clipped.length, authenticReplay: { welcome: wC.length, koan: kC.length },
      controlWindows: controlWindows.map(w => ({ donor: w.donor, start: w.start, end: w.end, oov: w.oov, maxLen: w.maxLen }))
    },
    controls: { nativeControls, nullControls, nativeGate, nullGate, pass: gate }
  };
  if (!gate) {
    output.original = null;
    output.decision = "Calibration failed; original chapter not scored by this confirmatory run.";
    return output;
  }
  const originalSearch = runSearch(originalGroups);
  output.original = {
    candidateKeys: originalSearch.ranked.length,
    anchorSupport: originalSearch.support,
    passingKeys: originalSearch.passing.map(x => ({
      key: x.id, covered: x.covered, missing: x.missing, anchorGroups: x.anchorGroups,
      edgeCount: x.edgeCount, uniqueWordGroups: x.uniqueWordGroups, uniqueEdgeGroups: x.uniqueEdgeGroups
    })),
    top: originalSearch.ranked.slice(0, 12).map(x => ({
      key: x.id, covered: x.covered, missing: x.missing, anchorGroups: x.anchorGroups,
      edgeCount: x.edgeCount, uniqueWordGroups: x.uniqueWordGroups, uniqueEdgeGroups: x.uniqueEdgeGroups
    }))
  };
  if (originalSearch.passing.length) {
    output.original.phaseGraphs = originalSearch.passing.map(x => {
      const detail = evaluateKey(originalGroups, x.K, true);
      return { key: x.id, graph: phaseGraph(detail),
        totalWordOptions: detail.totalWordOptions,
        uniqueWordGroups: detail.uniqueWordGroups,
        uniqueEdgeGroups: detail.uniqueEdgeGroups };
    });
    output.decision = "At least one key meets the frozen group-coverage gate; hand off phase-order recovery and ambiguity analysis.";
  } else {
    output.decision = "No group-aligned long-anchor q8 key decodes at least 636/669 groups under all eight latent starts; retire this bounded model.";
  }
  return output;
}
if (require.main === module) {
  const raw = INPUTS.map(p => fs.readFileSync(path.join(__dirname, "..", p), "utf8"));
  console.log(JSON.stringify(experiment(raw), null, 2));
}
module.exports = { experiment };
