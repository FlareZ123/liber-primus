'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const mod = (x) => ((x % 29) + 29) % 29;
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

function outsideInH(values) {
  const out = [];
  for (let i = 0; i < Math.floor(values.length / 2); i += 1) {
    out.push(mod(values[i] - values[values.length - 1 - i]));
  }
  if (values.length % 2 === 1) out.push(values[Math.floor(values.length / 2)]);
  for (let i = Math.floor(values.length / 2) - 1; i >= 0; i -= 1) {
    out.push(mod(values[i] + values[values.length - 1 - i]));
  }
  return out;
}

function parseCorpus(corpus, transcription) {
  const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const parts = transcription.split('%');
  const segment = (page) => (page === 50 ? '' : parts[page >= 51 ? page - 1 : page]);
  const wordsByPage = new Map();
  const pageLines = new Map();

  for (let page = 0; page <= 55; page += 1) {
    if (page === 50) {
      wordsByPage.set(page, []);
      pageLines.set(page, []);
      continue;
    }

    const words = [];
    let values = [];
    let start = 0;
    let offset = 0;
    const emit = () => {
      if (!values.length) return;
      words.push({page, start, values: values.slice()});
      values = [];
    };

    for (const ch of segment(page)) {
      const value = runeIndex.get(ch);
      if (value !== undefined) {
        if (!values.length) start = offset;
        values.push(value);
        offset += 1;
      } else if ('-.&$§'.includes(ch)) {
        emit();
      }
    }
    emit();
    check(offset === corpus.pages[page].indices.length, `page ${page} rune-count mismatch`);
    wordsByPage.set(page, words);

    const lineLengths = [];
    for (const line of segment(page).split('\n')) {
      let count = 0;
      for (const ch of line) if (runeIndex.has(ch)) count += 1;
      if (count) lineLengths.push(count);
    }
    pageLines.set(page, lineLengths);
  }

  return {
    wordsByPage,
    allWords: [...wordsByPage.values()].flat(),
    pageLines,
  };
}

function experiment(corpus, transcription, ink) {
  const parsed = parseCorpus(corpus, transcription);
  const byPage = new Map(ink.pages.map((p) => [p.page, p]));
  const p6 = byPage.get(6);
  const p23 = byPage.get(23);
  check(p6 && p23, 'missing p6/p23 ink annotations');

  const p6End = p6.red_spans[0].start + p6.red_spans[0].length;
  const p23End = p23.red_spans[0].start + p23.red_spans[0].length;
  const p6Successor = parsed.wordsByPage.get(6).find((w) => w.start === p6End);
  const p23Successor = parsed.wordsByPage.get(23).find((w) => w.start === p23End);
  check(p6Successor && p23Successor, 'missing immediate black successors');

  const h6 = outsideInH(p6Successor.values);
  const h23 = outsideInH(p23Successor.values);
  check(eq(h6, [12,17,22,25,5,1,0]), 'unexpected p6 H successor');
  check(eq(h23, [0,16,8,12,9,22,25,27]), 'unexpected p23 H successor');

  const pairs6 = h6.slice(0, -1).map((x, i) => [x, h6[i + 1]]);
  const pairs23 = h23.slice(0, -1).map((x, i) => [x, h23[i + 1]]);
  const sharedPairs = pairs6.filter((a) => pairs23.some((b) => eq(a, b)));
  check(sharedPairs.length === 1 && eq(sharedPairs[0], [22,25]), 'shared ordered H pair is not uniquely [22,25]');
  const packet = sharedPairs[0];

  // Upstream p23 navigation independently selects physical p25. Read the packet
  // as [first-line rune count, selected page]. No zero/one-based rune indexing is needed.
  const page = packet[1];
  check(page === 25, 'shared packet does not select p25 as expected');
  const lineLengths = parsed.pageLines.get(page);
  check(lineLengths && lineLengths[0] === packet[0], 'p25 first rune line is not 22 runes');

  const secondLineStart = lineLengths[0];
  const topWord = parsed.wordsByPage.get(page).find((w) => w.start === secondLineStart);
  check(topWord && eq(topWord.values, [26,6]), 'unexpected p25 second-line first word');
  const topH = outsideInH(topWord.values);
  check(eq(topH, [20,3]), 'unexpected H2 for p25 top selector');

  const orientations = [topH, topH.slice().reverse()];
  const fiveRuneWords = parsed.allWords.filter((w) => w.values.length === 5);
  const prefixHits = orientations.map((prefix) => ({
    prefix,
    hits: fiveRuneWords.filter((w) => w.values[0] === prefix[0] && w.values[1] === prefix[1]),
  }));
  check(prefixHits[0].hits.length === 0, 'direct [20,3] unexpectedly selects a five-rune word');
  check(prefixHits[1].hits.length === 1, 'reversed [3,20] does not uniquely select one five-rune word');

  const selected = prefixHits[1].hits[0];
  check(selected.page === 25 && selected.start === 145, 'reversed H prefix does not select p25 offset145');
  check(eq(selected.values, [3,20,10,11,16]), 'unexpected selected p25 five-rune operand');

  const sideObject = corpus.pages[25].indices.slice(144, 150);
  check(eq(sideObject, [18,3,20,10,11,16]), 'unexpected p25 side object');
  const transformed = sideObject.map((x, i) => Number((BigInt(x) ** BigInt(i === 0 ? 3 : 27)) % 29n));
  check(eq(transformed, [3,10,16,3,8,20]), 'unexpected p25 cube/reciprocal output');
  const transformedOuter = [transformed[0], transformed[transformed.length - 1]];
  check(eq(transformedOuter, prefixHits[1].prefix), 'selected prefix does not equal transformed outer endpoints');

  const line22Pages = [];
  for (let p = 0; p <= 55; p += 1) {
    if (p === 50) continue;
    const lines = parsed.pageLines.get(p);
    if (!lines || lines[0] !== 22) continue;
    const word = parsed.wordsByPage.get(p).find((w) => w.start === 22);
    line22Pages.push({
      page: p,
      word: word ? {start: word.start, values: word.values, h: word.values.length === 2 ? outsideInH(word.values) : null} : null,
    });
  }
  check(line22Pages.length === 13, 'unexpected first-line-length-22 page count');
  check(line22Pages.filter((x) => x.word && x.word.values.length === 2).length === 1, 'p25 is not unique among line22 pages with a two-rune next-line word');

  const exactH203 = parsed.allWords.filter((w) => w.values.length === 2 && eq(outsideInH(w.values), [20,3]));
  check(exactH203.length === 1 && exactH203[0].page === 25 && exactH203[0].start === 22, 'H2=[20,3] is not manuscript-unique at p25:22');

  return {
    sharedPacket: packet,
    p6Successor: {start: p6Successor.start, values: p6Successor.values, h: h6},
    p23Successor: {start: p23Successor.start, values: p23Successor.values, h: h23},
    p25: {
      firstRuneLineLength: lineLengths[0],
      secondLineStart,
      topWord: {start: topWord.start, values: topWord.values, h: topH},
      fiveRunePrefixOrientations: prefixHits.map((x) => ({prefix: x.prefix, hits: x.hits.map((h) => ({page: h.page, start: h.start, values: h.values}))})),
      selectedFiveRuneWord: {page: selected.page, start: selected.start, values: selected.values},
      sideObject,
      transformed,
      transformedOuter,
    },
    controls: {
      wordCount: parsed.allWords.length,
      twoRuneWordCount: parsed.allWords.filter((w) => w.values.length === 2).length,
      fiveRuneWordCount: fiveRuneWords.length,
      exactH203: exactH203.map((w) => ({page: w.page, start: w.start, values: w.values})),
      line22Pages,
    },
  };
}

const result = experiment(
  JSON.parse(read('resources/liber-primus/lp2-corpus.json')),
  read('resources/liber-primus/lp2-transcription.txt'),
  JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json')),
);

console.log(JSON.stringify(result, null, 2));
