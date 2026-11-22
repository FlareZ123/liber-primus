'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} relative @returns {string} */
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

/**
 * @param {string} text
 * @param {Set<string>} runes
 * @returns {{start:number,end:number,len:number}[]}
 */
function manuscriptWords(text, runes) {
  const words = [];
  let start = 0;
  let offset = 0;
  let active = false;
  for (const ch of text.replaceAll('/\n', '').replace(/\r?\n/g, '')) {
    if (runes.has(ch)) {
      if (!active) start = offset;
      active = true;
      offset += 1;
    } else if ('-.$&§'.includes(ch) && active) {
      words.push({ start, end: offset, len: offset - start });
      active = false;
    }
  }
  if (active) words.push({ start, end: offset, len: offset - start });
  return words;
}

/** @param {string} w @returns {number} */
const englishGP = (w) => w.toUpperCase().replace(/ING|TH|NG|EO|OE|AE|EA|IA/g, '*')
  .replace(/[^A-Z*]/g, '').length;

/** @param {string} armor @returns {string} */
function clearSigned(armor) {
  armor = armor.replace(/\r\n/g, '\n');
  const from = armor.indexOf('-----BEGIN PGP SIGNED MESSAGE-----');
  const header = armor.indexOf('\n\n', from);
  const to = armor.indexOf('-----BEGIN PGP SIGNATURE-----', header);
  assert(from >= 0 && header > from && to > header);
  return armor.slice(header + 2, to).split('-----BEGIN PGP MESSAGE-----')[0]
    .replace(/^- /gm, '');
}

/**
 * @param {number[]} target
 * @param {number[]} source
 * @returns {{difference:number,offset:number}}
 */
function best(target, source) {
  let difference = Infinity;
  let offset = -1;
  for (let i = 0; i + target.length <= source.length; i += 1) {
    let d = 0;
    for (let j = 0; j < target.length; j += 1) {
      d += Math.abs(target[j] - source[i + j]);
      if (d >= difference) break;
    }
    if (d < difference) {
      difference = d;
      offset = i;
    }
  }
  return { difference: Number.isFinite(difference) ? difference : null, offset };
}

/** @returns {void} */
function main() {
  const data = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
  const alphabet = new Set(data.runes);
  const words = manuscriptWords(read('resources/liber-primus/lp2-transcription.txt'), alphabet);
  const pageStart = (n) => data.pages.slice(0, n)
    .reduce((v, page) => v + page.indices.length, 0);
  assert.equal(data.pages[50].indices.length, 0);
  const endpoints = [
    [pageStart(48) + data.pages[48].indices.length - 72, pageStart(49) + 66],
    [pageStart(51), pageStart(52) + 78]
  ];
  assert.deepEqual(endpoints, [[11976, 12114], [12114, 12284]]);
  const targets = endpoints.map(([a, b]) => words
    .filter((w) => w.start >= a && w.end <= b).map((w) => w.len));
  assert.deepEqual(targets.map((q) => [q.length, q.reduce((a, b) => a + b, 0)]),
    [[33, 138], [40, 170]]);
  assert.deepEqual(targets[0], [
    5,3,6,3,3,2,8,4,5,7,5,3,3,4,3,9,2,3,2,4,6,2,4,3,4,6,3,3,4,6,5,2,6
  ]);
  assert.deepEqual(targets[1], [
    3,6,5,5,3,4,3,3,8,3,8,1,3,7,4,8,3,8,4,4,2,8,7,3,6,1,3,3,4,5,3,2,1,7,2,4,6,3,2,5
  ]);
  const messages = [
    'resources/historical/cicada2012-midi-email.asc',
    'resources/external/2013-do-not-share-this-information-2.asc',
    'resources/historical/cicada2014-stage09-first-jpeg-recovered.asc',
    'resources/historical/cicada2016-4gq25-outguess.asc'
  ];
  const allSources = messages.map((name) => ({
    name,
    lengths: [...clearSigned(read(name)).matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g)]
      .map((m) => englishGP(m[0]))
  }));
  for (const s of solved.sections) {
    const lengths = s.source_text.split(/[•⁘⁚⁜\s]+/)
      .map((v) => [...v].filter((ch) => alphabet.has(ch)).length)
      .filter((n) => n > 0);
    allSources.push({ name: 'solved_GP_' + s.name, lengths });
  }
  assert.equal(allSources.length, 13);
  // Original signed-message words as a planted, independently held-out direct crib.
  assert.deepEqual(best(allSources[1].lengths.slice(19, 52), allSources[1].lengths),
    { difference: 0, offset: 19 });
  const parable = allSources.find((s) => s.name === 'solved_GP_p57_parable');
  assert(parable && parable.lengths.length === 20);
  const outcomes = allSources.map((s) => {
    const before = best(targets[0], s.lengths);
    const after = best(targets[1], s.lengths);
    assert(before.difference === null || before.difference > 0);
    assert(after.difference === null || after.difference > 0);
    return { source: s.name, sourceWords: s.lengths.length, before, after };
  });
  console.log(JSON.stringify({
    originalBefore: 'p48 last72 + p49 all66, 33 words, 138 runes',
    originalAfter: 'p51 all92 + p52 first78, 40 words, 170 runes',
    positive: 'exact 33-word first-party 2013 planted direct crib recovered at offset19',
    results: outcomes
  }, null, 2));
}
main();
