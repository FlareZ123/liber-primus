"use strict";
/**
 * Source-locked original LP2 challenge for a combined cipher mechanism:
 * OutGuess ARC4 pad from the genuine 2016 carrier's key derivation, at most
 * one inserted ciphertext rune per visible word, and the established
 * collision-conditioned hidden key advances. A synthetic native-GP English
 * control is encrypted using the same two defects before blind inversion.
 *
 * This is a finite source hypothesis. No LP2 plaintext is assumed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/lp2-transcription.txt");
const dictionary = read("resources/control/english_wordfreq_textblob.txt");
const english = read("resources/control/shakespeare_first300k.txt");
const alphabet = corpus.translit.map((token, i) => ({
  token: token.toLowerCase(), i
})).sort((a, b) => b.token.length - a.token.length);

/** @param {string} word @returns {number[] | null} */
function encode(word) {
  const value = word.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const output = [];
  for (let i = 0; i < value.length;) {
    const item = alphabet.find((a) => value.startsWith(a.token, i));
    if (!item) return null;
    output.push(item.i);
    i += item.token.length;
  }
  return output;
}
const glyph = new Map(corpus.runes.map((rune, index) => [rune, index]));
/** @returns {{page:number,end:number,indices:number[]}[]} */
function originalWords() {
  const words = [];
  let word = [], start = 0, last = 0, page = 0;
  for (const ch of raw.split("%").slice(0, 55).join("%")) {
    if (glyph.has(ch)) {
      if (!word.length) start = page;
      word.push(glyph.get(ch));
      last = page;
    } else if (ch === "%") {
      page++;
    } else if (!(/[\/\s]/u.test(ch))) {
      if (word.length) words.push({ page: start, end: last, indices: word });
      word = [];
    }
  }
  if (word.length) words.push({page:start,end:last,indices:word});
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, w) => n + w.indices.length, 0), 12956);
  return words;
}
/** @returns {{frequencies:Map<string,number>,total:number}} */
function lexicon() {
  const frequencies = new Map();
  let total = 0;
  for (const line of dictionary.split("\n")) {
    const match = line.match(/^([a-z]+)\s+(\d+)$/);
    if (!match) continue;
    const indices = encode(match[1]);
    if (!indices) continue;
    const key = indices.join(",");
    const n = Number(match[2]);
    frequencies.set(key, (frequencies.get(key) || 0) + n);
    total += n;
  }
  assert.ok(frequencies.size > 25000);
  return { frequencies, total };
}

/**
 * Original OutGuess arc.c arc4_initkey: MD5(role||key), 256-step
 * arc4_addrandom, then canonical ARC4 getbyte. No guessed ARC4 drops.
 * @param {"Encryption"|"Seeding"} role
 * @param {string} password
 * @param {number} length
 * @returns {number[]}
 */
function arc4Bytes(role, password, length) {
  const digest = createHash("md5").update(role + password, "ascii").digest();
  const s = Uint8Array.from({length:256}, (_,i)=>i);
  let i = 255, j = 0;
  for (let t = 0; t < 256; t++) {
    i = (i + 1) & 255;
    const si = s[i];
    j = (j + si + digest[t % 16]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  const out = [];
  for (let t = 0; t < length; t++) {
    i = (i + 1) & 255;
    const si = s[i];
    j = (j + si) & 255;
    const sj = s[j];
    [s[i], s[j]] = [sj, si];
    out.push(s[(si + sj) & 255]);
  }
  return out;
}
/**
 * @param {string} role
 * @param {string} password
 * @param {"mod"|"scaled"} reduction
 * @param {number} sign
 * @param {number} length
 * @returns {number[]}
 */
function keys(role, password, reduction, sign, length) {
  return arc4Bytes(role, password, length).map((b) =>
    ((sign * (reduction === "mod" ? b % 29 :
      Math.floor(29 * b / 256))) % 29 + 29) % 29);
}
const mod29 = (x) => (x % 29 + 29) % 29;
const decodeGP = (indices) => indices.map((i) => corpus.translit[i]).join("");
/**
 * Dynamic-programming Viterbi by the number of consumed key symbols.
 * Each printed word can have zero or one inserted observed rune. Every
 * genuine emitted rune can consume one key symbol or a second symbol
 * after an EXACT collision with the preceding published ciphertext.
 * Score is the independent reference lexicon plus fixed insertion and
 * collision-rejection priors, with no fitted language/alphabet table.
 *
 * @param {number[][]} words
 * @param {number[]} key
 * @param {Map<string,number>} frequencies
 * @param {number} total
 * @param {number} maxNulls
 * @param {number} maxKeySkips
 */
function decode(words, key, frequencies, total, maxNulls, maxKeySkips) {
  let states = new Map([[0, {
    score:0, plains:[], nulls:0, skips:0, hits:0
  }]]);
  let previous = -1;
  for (const word of words) {
    const length = word.length, next = new Map();
    for (const [keyIndex, existing] of states) {
      /**
       * @param {number} pos @param {number} cursor
       * @param {number} usedNull @param {number} localSkips
       * @param {number[]} plain
       */
      function extend(pos, cursor, usedNull, localSkips, plain) {
        if (pos === length) {
          const nulls = existing.nulls + usedNull;
          const skips = existing.skips + localSkips;
          if (nulls > maxNulls || skips > maxKeySkips) return;
          const frequency = frequencies.get(plain.join(",")) || .001;
          const score = existing.score + Math.log(frequency / total) +
            (usedNull ? Math.log(.45 / length) : Math.log(.55)) +
            localSkips * Math.log(.81);
          const prior = next.get(cursor);
          if (!prior || score > prior.score) next.set(cursor, {
            score, plains:[...existing.plains,decodeGP(plain)],nulls,skips,
            hits:existing.hits + Number(frequencies.has(plain.join(",")))
          });
          return;
        }
        const symbol = word[pos];
        const preceding = pos ? word[pos - 1] : previous;
        if (!usedNull && length > 1) {
          extend(pos + 1, cursor, 1, localSkips, plain);
        }
        if (cursor < key.length) {
          const p = mod29(symbol - key[cursor]);
          extend(pos + 1, cursor + 1, usedNull, localSkips, [...plain,p]);
        }
        if (cursor + 1 < key.length && localSkips < 3) {
          const p = mod29(symbol - key[cursor + 1]);
          if (preceding >= 0 &&
            mod29(p + key[cursor]) === preceding) {
            extend(pos + 1, cursor + 2, usedNull,
              localSkips + 1, [...plain,p]);
          }
        }
      }
      extend(0, keyIndex, 0, 0, []);
    }
    assert.ok(next.size > 0, "No valid decoder state");
    previous = word.at(-1);
    states = next;
  }
  const ranked = [...states.values()].sort((a,b)=>b.score-a.score);
  return {...ranked[0],states:states.size};
}
/** @returns {()=>number} */
function rng3301() {
  let state = 0x3301;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
/**
 * Matched hidden-key positive control: insert one null within a word with
 * probability .45 and reject would-be repeated published runes with
 * probability .81, holding the same original plaintext rune across retries.
 * Inserted runes consume no key.
 * @param {number[][]} words
 * @param {number[]} key
 */
function plant(words,key) {
  const random = rng3301(), output = [];
  let cursor = 0, previous = -1, insertions = 0, skipped = 0;
  for (const word of words) {
    const extra = random() < .45
      ? Math.floor(random() * (word.length + 1)) : -1;
    const printed = [];
    for (let i = 0; i <= word.length; i++) {
      if (i === extra) {
        const symbol = Math.floor(random() * 29);
        printed.push(symbol);
        previous = symbol;
        insertions++;
      }
      if (i === word.length) break;
      const p = word[i];
      for (;;) {
        const symbol = mod29(p + key[cursor++]);
        if (symbol === previous && random() < .81) {
          skipped++;
          continue;
        }
        printed.push(symbol);
        previous = symbol;
        break;
      }
    }
    output.push(printed);
  }
  return {output,insertions,skipped};
}
function main() {
  const p0 = originalWords().filter((w) => w.page === 0 &&
    w.end === 0).map((w) => w.indices);
  const {frequencies,total} = lexicon();
  const size = p0.reduce((n,w)=>n+w.length,0);
  assert.equal(p0.length,58);
  assert.equal(size,261);
  const models = [];
  for (const [role,password] of [
    ["Encryption","LCBPNGPARRTHBPC"],
    ["Encryption","7144649572585460758"],
    ["Seeding","LCBPNGPARRTHBPC"],
    ["Seeding","7144649572585460758"],
    // The real 2016 4gq25.jpg was extracted with OutGuess -r and no -k.
    // Empty password is an independently authenticated source control.
    ["Encryption",""],
    ["Seeding",""]])
    for (const reduction of ["mod","scaled"])
      for (const sign of [-1,1]) {
        const key = keys(role,password,reduction,sign,500);
        const found = decode(p0,key,frequencies,total,35,32);
        models.push({role,password,reduction,sign,
          score:found.score,wordHits:found.hits,
          nulls:found.nulls,keySkips:found.skips,
          firstWords:found.plains.slice(0,28).join(" ")});
      }
  models.sort((a,b)=>b.score-a.score);
  assert.equal(models.length,24);
  const sourcePasswordModels=models.filter(m=>m.password);
  const authenticEmptyModels=models.filter(m=>!m.password);
  sourcePasswordModels.sort((a,b)=>b.score-a.score);
  authenticEmptyModels.sort((a,b)=>b.score-a.score);
  const sourceControl = (english.slice(190000).match(/[A-Za-z]+/g) ||
    []).slice(0,58).map(encode);
  assert.ok(sourceControl.every((w) => w !== null));
  const heldoutKey = keys("Encryption","LCBPNGPARRTHBPC","scaled",1,500);
  const encoded = plant(sourceControl,heldoutKey);
  const recovered = decode(encoded.output,heldoutKey,
    frequencies,total,40,40);
  const sourceWords = sourceControl.map(decodeGP);
  const exact = sourceWords.filter((word,i) =>
    word === recovered.plains[i]).length;
  assert.ok(exact >= 45, "Uninformative control decoder");
  // Freeze the p0-selected construction and carry the same key clock
  // forward through complete original words at physical pages 0 and 1.
  // The word crossing the page boundary is retained as a single word.
  const selected = sourcePasswordModels[0];
  const emptySelected = authenticEmptyModels[0];
  const page01 = originalWords().filter((w) => w.end <= 1);
  const fullKey = keys(selected.role,selected.password,
    selected.reduction,selected.sign,1000);
  const heldout = decode(page01.map((w) => w.indices),fullKey,
    frequencies,total,80,65);
  const page1WordCount = page01.filter((w) => w.page === 1).length;
  const page1Heldout = heldout.plains.slice(-page1WordCount);
  const emptyKey=keys(emptySelected.role,emptySelected.password,
    emptySelected.reduction,emptySelected.sign,1000);
  const emptyHeldout=decode(page01.map(w=>w.indices),emptyKey,
    frequencies,total,80,65);
  const emptyPlant=plant(sourceControl,
    keys("Encryption","","scaled",1,500));
  const emptyRecovered=decode(emptyPlant.output,
    keys("Encryption","","scaled",1,500),frequencies,total,40,40);
  const emptyExact=sourceWords.reduce((n,word,i)=>
    n+Number(word===emptyRecovered.plains[i]),0);
  assert.ok(emptyExact>=45,"Empty historical password plant failed");
  console.log(JSON.stringify({
    models:models.length,originalP0CompleteWords:p0.length,
    originalP0Runes:size,originalTop:sourcePasswordModels.slice(0,8),
    historicalEmptyPassword:{models:authenticEmptyModels.length,
      best:emptySelected,heldoutScore:emptyHeldout.score,
      heldoutFirstWords:emptyHeldout.plains.slice(-page1WordCount)
        .slice(0,25).join(" "),
      plant:{words:sourceControl.length,
        actualInsertions:emptyPlant.insertions,
        actualSkips:emptyPlant.skipped,
        recoveredExactWords:emptyExact}},
    originalPage1Heldout:{completeWords:page1WordCount,
      selectedPage0Model:selected,
      originalFirstWords:page1Heldout.slice(0,32).join(" "),
      combinedScore:heldout.score,
      combinedLexiconHits:heldout.hits,
      combinedNulls:heldout.nulls,
      combinedKeySkips:heldout.skips},
    planted:{words:sourceControl.length,
      plaintextRunes:sourceControl.flat().length,
      printedRunes:encoded.output.flat().length,
      injectedRrunes:encoded.insertions,rejectedKeyDraws:encoded.skipped,
      recoveredExactWords:exact,
      score:recovered.score,
      truthHead:sourceWords.slice(0,25).join(" "),
      decodedHead:recovered.plains.slice(0,25).join(" ")}
  },null,2));
}
main();
