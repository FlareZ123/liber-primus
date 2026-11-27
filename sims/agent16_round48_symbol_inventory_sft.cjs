#!/usr/bin/env node
'use strict';

// Reproduce the solved-source symbol inventory and LP2 remembered-drop discriminator.
// Inputs are repository-pinned; no network and no language model are used.

const fs = require('fs');
const solved = JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
const transcript = fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));

const runes = new Set(solved.runes);
if (runes.size !== 29) throw new Error('expected GP29');

function nonRuneSymbols(lines) {
  const out = new Set();
  for (const line of lines) for (const ch of [...line]) {
    if (!runes.has(ch) && !/\s/u.test(ch)) out.add(ch);
  }
  return [...out].sort();
}

const proseLines = [];
const listLines = [];
for (const section of solved.sections) {
  for (const line of section.source_text.split('\n')) {
    if (![...line].some(ch => runes.has(ch))) continue;
    if (/^[12][ᚠ-ᛠ]/u.test(line) && !/[0-9]/u.test(line.slice(1))) {
      listLines.push(line);
      continue;
    }
    if (/[0-9]/u.test(line)) continue; // magic-square/hash data channel
    proseLines.push(line);
  }
}

const coreObserved = nonRuneSymbols(proseLines);
const listObserved = [...new Set(listLines.map(x => x[0]))].sort();
const coreExpected = ['"',"'",'•','⁘','⁚','⁜'].sort();
if (JSON.stringify(coreObserved)!==JSON.stringify(coreExpected)) {
  throw new Error('unexpected core prose inventory: '+JSON.stringify(coreObserved));
}
if (JSON.stringify(listObserved)!==JSON.stringify(['1','2'])) {
  throw new Error('unexpected list-label inventory: '+JSON.stringify(listObserved));
}

// The canonical transcript contains p0..p57.  The authoritative unsolved
// prefix is the first 12,956 GP29 runes, p0..p55.
const canonRunes = new Set(corpus.runes);
let nRune=0, cut=-1;
const chars=[...transcript];
for (let i=0;i<chars.length;i++) {
  if (canonRunes.has(chars[i])) nRune++;
  if (nRune===12956) { cut=i+1; break; }
}
if (cut<0) throw new Error('unsolved-prefix cut not found');
const pre=chars.slice(0,cut).join('');
const count = ch => [...pre].filter(x=>x===ch).length;
const visible = {
  word_dividers: count('-'),
  period_marks: count('.'),
  line_wraps: count('/'),
  page_marks: count('%'),
  ampersand: count('&'),
  dollar: count('$')
};

const N=12956, pairs=N-1, D=86;
const rows=[];
for (const m of [35,36,37]) {
  const q=(m-29)/(29*(m-1));
  const ll=D*Math.log(q)+(pairs-D)*Math.log1p(-q); // common binomial factor omitted
  rows.push({
    m,
    silent_symbols:m-29,
    q,
    expected_doublets:pairs*q,
    expected_silent_events:N*(m-29)/29,
    log_likelihood_without_common_factor:ll
  });
}
const mx=Math.max(...rows.map(x=>x.log_likelihood_without_common_factor));
for (const r of rows) r.relative_likelihood=Math.exp(r.log_likelihood_without_common_factor-mx);

const impliedM=29+29*(visible.word_dividers+visible.period_marks)/N;

console.log(JSON.stringify({
  source_inventory:{
    base_gp29:29,
    core_nonrune_prose:coreObserved,
    core_table_size:29+coreObserved.length,
    optional_list_labels:listObserved,
    with_list_labels_table_size:29+coreObserved.length+listObserved.length
  },
  lp2_unsolved_prefix:{
    runes:N,
    observed_doublets:D,
    visible,
    word_plus_period:visible.word_dividers+visible.period_marks,
    m_if_that_count_were_one_silent_event_each:impliedM
  },
  remembered_drop:rows
},null,2));
