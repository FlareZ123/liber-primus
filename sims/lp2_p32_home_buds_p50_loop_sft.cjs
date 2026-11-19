"use strict";

/**
 * Agent8 SFT: independently selected p32 HOME/BUDS receiver for the frozen
 * WAY -> digit-cardinal -> hex-cardinal p50 transition.
 *
 * Reads only canonical repository resources. No unknown plaintext is assumed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const wordfreq = read("resources/control/english_wordfreq_textblob.txt");
const tableTokens = grid.pages.flatMap((page) => page.tokens);

const gpAlphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((left, right) => right.token.length - left.token.length);

/** @param {string} word @returns {number[]} */
function tokenize(word) {
  let rest = word
    .toLowerCase()
    .replace(/qu/g, "cw")
    .replace(/v/g, "u")
    .replace(/[kq]/g, "c")
    .replace(/z/g, "s")
    .replace(/[^a-z]/g, "");
  const out = [];
  while (rest.length > 0) {
    if (rest.startsWith("ing")) {
      out.push(21);
      rest = rest.slice(3);
      continue;
    }
    if (rest.startsWith("io")) {
      out.push(27);
      rest = rest.slice(2);
      continue;
    }
    const hit = gpAlphabet.find(({ token }) => rest.startsWith(token));
    assert.ok(hit, "unrecognized GP token in " + word + ": " + rest);
    out.push(hit.index);
    rest = rest.slice(hit.token.length);
  }
  return out;
}

/** @param {string} word */
const gp0 = (word) => tokenize(word).reduce((sum, value) => sum + value, 0);

const body = signed2016
  .slice(
    signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----")
  )
  .replace(/\b7A35090F\b/g, "");
const signedWords =
  body.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);

const alphabet60 = grid.alphabet;
/** @param {string} token @returns {number} */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, "invalid base60 token " + token);
  return high * 60 + low;
}
const table60 = tableTokens.map(decode60);

/** @param {number} start @param {number} steps @returns {number[]} */
function walk60(start, steps) {
  const route = [start];
  let state = start;
  for (let index = 0; index < steps; index += 1) {
    assert.ok(state >= 0 && state < table60.length);
    state = table60[state];
    route.push(state);
  }
  return route;
}

// Independently established upstream selector: EPIPHANY SEEKS THE DEVOTED.
const route = walk60(gp0("SEEKS"), 23);
assert.deepEqual(route, [
  71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,
  70,169,228,144,125,20,102,32,
]);
assert.equal(gp0("EPIPHANY"), 121);
assert.equal(gp0("EMPTY"), 92);
assert.equal(gp0("THE"), 20);
assert.equal(gp0("DEVOTED"), 102);
assert.equal(route.indexOf(gp0("EMPTY")), 7);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p32 = corpus.pages.find((page) => page.page === 32);
assert.ok(p32);
assert.equal(gp0("BUDS"), 56);
assert.equal(gp0("HOME"), 48);
assert.equal(p32.indices.length, 121);

/** @returns {{start:number,end:number,indices:number[],text:string}[]} */
function parseP32Fragments() {
  const raw = transcription.split("%")[32];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (current.length === 0) return;
    words.push({
      start,
      end: offset,
      indices: current.slice(),
      text: current.map((value) => corpus.translit[value]).join("").toUpperCase(),
    });
    current = [];
  };
  for (const char of raw) {
    if (runeIndex.has(char)) {
      if (current.length === 0) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, 121);
  return words;
}

const p32Fragments = parseP32Fragments();
assert.equal(p32Fragments.length, 22);
function endsWithBoundary(raw) {
  for (let index = raw.length - 1; index >= 0; index -= 1) {
    const char = raw_index];
    if (char === "/" || /\s/u.test(char)) continue;
    return !runeIndex.has(char);
  }
  return true;
}
const pages = transcription.split("%");
assert.equal(endsWithBoundary(pages[31]), false);
assert.equal(p32Fragments.length - 1, 21);
const boundaries = new Set(p32Fragments.flatMap((word) => [word.start, word.end]));
const emptyStep = route.indexOf(gp0("EMPTY"));
const selectedWord = p32Fragments[emptyStep];
assert.equal(p32Fragments.slice(1, emptyStep + 1).length, 7);
assert.deepEqual(
  { index: emptyStep, start: selectedWord.start, end: selectedWord.end, text: selectedWord.text },
  { index: 7, start: 33, end: 44, text: "HOMEXWDSLFD" }
);
const selectedPosition = gp0("EMPTY") % selectedWord.indices.length;
assert.equal(selectedPosition, 4);
assert.equal(corpus.translit[selectedWord.indices[selectedPosition]], "X");
assert.equal(selectedWord.start + selectedPosition, 37);

// The independently established p32 11x11 orientation control.
const side = 11;
const prime = (value) => corpus.prime[value];
assert.equal(p32.indices.slice(0, side).reduce((sum, value) => sum + prime(value), 0), 563);
assert.equal(
  Array.from({ length: side }, (_, row) => p32.indices[row * side])
    .reduce((sum, value) => sum + prime(value), 0),
  569
);

const frequency = new Map();
for (const line of wordfreq.split(/\r?\n/u)) {
  const match = line.match(/^([a-z]{4})\s+(\d+)$/u);
  if (match) frequency.set(match[1].toUpperCase(), Number(match[2]));
}
const directions = [
  [0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1],
];
/** @param {number} row @param {number} col @param {number} dr @param {number} dc */
function fourLetterAt(row, col, dr, dc) {
  let text = "";
  for (let step = 0; step < 4; step += 1) {
    const y = row + step * dr;
    const x = col + step * dc;
    if (y < 0 || y >= side || x < 0 || x >= side) return null;
    const token = corpus.translit[p32.indices[y * side + x]];
    if (token.length !== 1) return null;
    text += token.toUpperCase();
  }
  return text;
}

const gridWords = [];
for (let row = 0; row < side; row += 1) {
  for (let col = 0; col < side; col += 1) {
    for (const [dr, dc] of directions) {
      const word = fourLetterAt(row, col, dr, dc);
      if (word && frequency.has(word)) {
        gridWords.push({ word, gp0: gp0(word), row, col, dr, dc, frequency: frequency.get(word) });
      }
    }
  }
}
assert.deepEqual(gridWords, [
  { word: "HOME", gp0: 48, row: 3, col: 0, dr: 0, dc: 1, frequency: 295 },
  { word: "BUDS", gp0: 56, row: 8, col: 5, dr: 0, dc: 1, frequency: 6 },
]);

// Charge every frozen DH field and every diagonal sign from the already selected HOME.
const dh = { p:23, g:5, a:6, b:15, A:8, B:19, K:2 };
assert.equal(selectedPosition + 1, dh.g);
const homeStart = 33;
const xOffset = 37;
const homeRow = Math.floor(homeStart / side);
const homeCol = homeStart % side;
const xRow = Math.floor(xOffset / side);
const xCol = xOffset % side;
const diagonalFamily = [];
for (const [field, value] of Object.entries(dh)) {
  const step = value % side;
  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const row = homeRow + dr * step;
      const col = homeCol + dc * step;
      const translatedXRow = xRow + dr * step;
      const translatedXCol = xCol + dc * step;
      if (
        row < 0 || row >= side || col < 0 || col + 3 >= side ||
        translatedXRow < 0 || translatedXRow >= side ||
        translatedXCol < 0 || translatedXCol >= side
      ) continue;
      const destination = row * side + col;
      const translatedX = translatedXRow * side + translatedXCol;
      const word = fourLetterAt(row, col, 0, 1);
      diagonalFamily.push({
        field,
        value,
        step,
        dr,
        dc,
        destination,
        translatedX,
        word,
        dictionary: word === null ? false : frequency.has(word),
        boundary: boundaries.has(translatedX),
      });
    }
  }
}
const dictionaryDiagonals = diagonalFamily.filter((row) => row.dictionary);
assert.deepEqual(dictionaryDiagonals, [{
  field: "g",
  value: 5,
  step: 5,
  dr: 1,
  dc: 1,
  destination: 93,
  translatedX: 97,
 word: "BUDS",
 dictionary: true,
 boundary: true,
}]);
const qualifiedDiagonals = diagonalFamily.filter((row) => row.dictionary && row.boundary);
assert.deepEqual(qualifiedDiagonals, [{
  field: "g",
  value: 5,
  step: 5,
  dr: 1,
  dc: 1,
  destination: 93,
  translatedX: 97,
  word: "BUDS",
  dictionary: true,
  boundary: true,
}]);
assert.equal(93 - 33, 60);
assert.equal(5 * (side + 1), 60);
assert.equal(97, p32Fragments[16].start);

// Exact frozen Agent10 p50 movement grammar.
const deltas = { N:[-1,0], S:[1,0], E:[0,1], W:[0,-1] };
/** @param {number} index @param {string} token */
function literalMove(index, token) {
  const match = token.match(/^([1-9])([NSEWnsew])$/u);
  if (!match) return null;
  const row = Math.floor(index / 8);
  const col = index 	HÂˆÛÛœİÙ‹×HH[\ÖÛX]ÚÌ—KÕ\\Ø\ÙJ
WNÂˆÛÛœİ\İ[˜ÙHH[X™\ŠX]ÚÌWJNÂˆÛÛœİ™^›İÈH›İÈ
Èˆ
ˆ\İ[˜ÙNÂˆÛÛœİ™^ÛÛHÛÛ
ÈÈ
ˆ\İ[˜ÙNÂˆ™]\›ˆ™^›İÈH	‰ˆ™^›İÈÌˆ	‰ˆ™^ÛÛH	‰ˆ™^ÛÛˆÈ™^›İÈ
ˆ
È™^ÛÛˆˆ[ÂŸB‹ÊŠˆ\˜[HÛ[X™\ŸH[™^\˜[HÜİš[™ßH\™Xİ[Ûˆ
‹Â™[˜İ[ÛˆÛ™Tİ\
[™^\™Xİ[ÛŠHÂˆÛÛœİ›İÈHX]™›ÛÜŠ[™^È
NÂˆÛÛœİÛÛH[™^Rƒ°¢6öç7B¶G"ÂF5ÒÒFVÇF5¶F—&V7F–öåÓ°¢6öç7BæW‡E&÷rÒ&÷r²G#°¢6öç7BæW‡D6öÂÒ6öÂ²F3°¢&WGW&âæW‡E&÷rãÒbbæW‡E&÷rÂ3"bbæW‡D6öÂãÒbbæW‡D6öÂÂ€¢òæW‡E&÷r¢‚²æW‡D6öÀ¢¢çVÆÃ°§Ğ¢ò¢¢&Ò¶çVÖ&W'Ò–æFW‚&Ò·7G&–æwÒFö¶Vâ¢ğ¦gVæ7F–öâ†W„6&F–æÄÖ÷fR†–æFW‚ÂFö¶Vâ’°¢–b‚õå³Ó”ÔfÖe×³'ÒB÷RçFW7B‡Fö¶Vâ’’&WGW&âçVÆÃ°¢6öç7BF—&V7F–öâÒ7G&–æræg&öÔ6†$6öFR„çVÖ&W"ç'6T–çB‡Fö¶VâÂb’’çFõWW$66R‚“°¢&WGW&âFVÇF5¶F—&V7F–öåÒòöæU7FW†–æFW‚ÂF—&V7F–öâ’¢çVÆÃ°§Ğ ¦6öç7BF&ÆT6ö×÷6—FUG&ç6—F–öç2ÒµÓ°¦f÷"†ÆWB6÷W&6RÒ²6÷W&6RÂF&ÆUFö¶Vç2æÆVæwFƒ²6÷W&6R³Ò’°¢6öç7BÖ–FFÆRÒÆ—FW&ÄÖ÷fR‡6÷W&6RÂF&ÆUFö¶Vç5·6÷W&6UÒ“°¢–b†Ö–FFÆRÓÓÒçVÆÂ’6öçF–çVS°¢6öç7BFW7F–æF–öâÒ†W„6&F–æÄÖ÷fR†Ö–FFÆRÂF&ÆUFö¶Vç5¶Ö–FFÆUÒ“°¢–b†FW7F–æF–öâÓÓÒçVÆÂ’6öçF–çVS°¢F&ÆT6ö×÷6—FUG&ç6—F–öç2çW6‚‡°¢6÷W&6RÀ¢6÷W&6UFö¶Vã¢F&ÆUFö¶Vç5·6÷W&6UÒÀ¢Ö–FFÆRÀ¢Ö–FFÆUFö¶Vã¢F&ÆUFö¶Vç5¶Ö–FFÆUÒÀ¢FW7F–æF–öâÀ¢Ò“°§Ğ¦76W'BæFVWWVÂ‡F&ÆT6ö×÷6—FUG&ç6—F–öç2Â·°¢6÷W&6S¢SrÀ¢6÷W&6UFö¶Vã¢#r"À¢Ö–FFÆS¢SbÀ¢Ö–FFÆUFö¶Vã¢#DR"À¢FW7F–æF–öã¢C‚À§ÕÒ“°¦76W'BæWVÂ†w‚%t’"’ÂSr“°¦76W'BæWVÂ†w‚$%TE2"’ÂSb“°¦76W'BæWVÂ†w‚$„ôÔR"’ÂC‚“°¦76W'BæWVÂ‡F&ÆUFö¶Vç5³C…ÒÂ#DB"“°¦76W'BæWVÂ††W„6&F–æÄÖ÷fRƒC‚ÂF&ÆUFö¶Vç5³C…Ò’ÂçVÆÂ“°¦76W'BæWVÂ…7G&–æræg&öÔ6†$6öFR„çVÖ&W"ç'6T–çB‡F&ÆUFö¶Vç5³C…ÒÂb’’Â$Ò"“° ¦6öç7B7FFTÆ&VÇ2ÒæWrÖ‚“°¦f÷"†6öç7Bv÷&Böbw&–Ev÷&°¢–b‚7FFTÆ&VÇ2æ†2‡v÷&Bæw’’7FFTÆ&VÇ2ç6WB‡v÷&BæwÂµÒ“°¢7FFTÆ&VÇ2ævWB‡v÷&Bæw’çW6‚‡v÷&Bçv÷&B“°§Ğ¦76W'BæFVWWVÂ‡7FFTÆ&VÇ2ævWBƒSb’Â²$%TE2%Ò“°¦76W'BæFVWWVÂ‡7FFTÆ&VÇ2ævWBƒC‚’Â²$„ôÔR%Ò“° ¦6öç7B3$6ö×÷6—FTÆ&VÇ2ÒF&ÆT6ö×÷6—FUG&ç6—F–öç0¢æf–ÇFW"‚‡&÷r’Óâ7FFTÆ&VÇ2æ†2‡&÷ræÖ–FFÆR’bb7FFTÆ&VÇ2æ†2‡&÷ræFW7F–æF–öâ’¢æÖ‚‡&÷r’Óâ‡°¢6÷W&6S¢&÷rç6÷W&6RÀ¢Ö–FFÆS¢&÷ræÖ–FFÆRÀ¢Ö–FFÆTÆ&VÇ3¢7FFTÆ&VÇ2ævWB‡&÷ræÖ–FFÆR’À¢FW7F–æF–öã¢&÷ræFW7F–æF–öâÀ¢FW7F–æF–öäÆ&VÇ3¢7FFTÆ&VÇ2ævWB‡&÷ræFW7F–æF–öâ’À¢Ò’“°¦76W'BæFVWWVÂ‡3$6ö×÷6—FTÆ&VÇ2Â·°¢6÷W&6S¢SrÀ¢Ö–FFÆS¢SbÀ¢Ö–FFÆTÆ&VÇ3¢²$%TE2%ÒÀ¢FW7F–æF–öã¢C‚À¢FW7F–æF–öäÆ&VÇ3¢²$„ôÔR%ÒÀ§ÕÒ“° ¦6öç7B6–væVCSrÒ²ââææWr6WB‡6–væVEv÷&G0¢æÖ‚‡v÷&B’Óâv÷&BçFõWW$66R‚’¢æf–ÇFW"‚‡v÷&B’Óâw‡v÷&B’ÓÓÒSr’•Ó°¦76W'BæFVWWVÂ‡6–væVCSrÂ²%t’"Â%t”ÄÂ%Ò“°¦6öç7BF†TföÆÆ÷vW'2Ò6–væVEv÷&G0¢æÖ‚‡v÷&BÂ–æFW‚’Óâv÷&BçFõWW$66R‚’ÓÓÒ%D„R"ò6–væVEv÷&G5¶–æFW‚²Ò¢çVÆÂ¢æf–ÇFW"‚‡v÷&B’Óâv÷&B¢æÖ‚‡v÷&B’Óâv÷&BçFõWW$66R‚’“°¦76W'BæFVWWVÂ‡F†TföÆÆ÷vW'2Â²%D‚"Â$DUdõDTB"Â%t’"Â$Ô"Â%$ôB"Â$D•$T5D”ôâ%Ò“°¦76W'BæFVWWVÂ‡F†TföÆÆ÷vW'2æf–ÇFW"‚‡v÷&B’Óâw‡v÷&B’ÓÓÒSr’Â²%t’%Ò“° ¦6öç6öÆRæÆör„¥4ôâç7G&–æv–g’‡°¢7FGW3¢%52"À¢W7G&VÓ¢°¢&÷WFRÀ¢V×G•7FWÀ¢6VÆV7FVEvS¢3"À¢vU'VæT6÷VçC¢3"æ–æF–6W2æÆVæwF‚À¢6VÆV7FVDg&vÖVçC¢6VÆV7FVEv÷&BçFW‡BÀ¢–æ6öÖ–æt6''“¢G'VRÀ¢6ö×ÆWFUv÷&E7F'G3¢#À¢6VÆV7FVE„öfg6WC¢6VÆV7FVEv÷&Bç7F'B²6VÆV7FVE÷6—F–öâÀ¢ÒÀ¢3$w&–C¢°¢6–FRÀ¢F÷&–ÖU7VÓ¢Sc2À¢ÆVgE&–ÖU7VÓ¢Sc’À¢f÷W$ÆWGFW%v÷&G3¢w&–Ev÷&G2À¢ÒÀ¢F–vöæÅG&ç6fW#¢°¢fÖ–Ç•6—¦S¢F–vöæÄfÖ–Ç’æÆVæwF‚À¢F–7F–öæ'”†—G3¢F–7F–öæ'”F–vöæÇ2À¢F–7F–öæ'”æD&÷VæF'”†—G3¢VÆ–f–VDF–vöæÇ2À¢fÆDF—7Æ6VÖVçC¢cÀ¢6VÆV7FVE&÷WFU&F—ƒ¢cÀ¢–çFW'&WFF–öã¢%F†RTÕE’×6VÆV7FVB„ôÔWÅ‚7â†2ÆVæwF‚sÓS²‚7WÆ–W2F–vöæÂvVöÖWG'’ÂæBG&ç6ÆF–ær„ôÔR'’‚¶rÂ¶r’ÆæG2öâ%TE2v†–ÆRF†R6VÆV7FVB‚ÆæG2öâ&–çFVB&÷VæF'’â"À¢ÒÀ¢g&÷¦VåS6ö×÷6—FS¢°¢G&ç6—F–öç3¢F&ÆT6ö×÷6—FUG&ç6—F–öç2À¢3$Æ&VÇ3¢3$6ö×÷6—FTÆ&VÇ2À¢FW&Ö–æÅFö¶Vã¢F&ÆUFö¶Vç5³C…ÒÀ¢FW&Ö–æÄ66–“¢$Ò"À¢FW&Ö–æÄFÖ—G4†W„6&F–æÄÖ÷fS¢fÇ6RÀ¢ÒÀ¢6÷W&6U&öÆS¢°¢6–væVDwóStÆ–6W3¢6–væVCSrÀ¢WF†VçF–6FVEF†TföÆÆ÷vW'3¢F†TföÆÆ÷vW'2À¢föÆÆ÷vW$wóSs¢%t’"À¢ÒÀ¢6Æ76–f–6F–öã ¢%6÷W&6RÖ6öç7G&–æVBVæ¶æ÷vâ×&V6V—fW"G&ç6fW"âF†RÇ&VG’f—†VBS6ö×÷6—FR†2—G2Væ—VR7FFW2SbæBC‚Æ&VÆVB'’3"w2öæÇ’f÷W"ÖÆWGFW"w&–Bv÷&G2%TE2æB„ôÔS²–æFWVæFVçFÇ’ÂF†Rg&÷¦VâD‚fÇVRsÓRG&ç6ÆFW2„ôÔRF÷vâ×&–v‡BFò%TE2v†–ÆR6''––ærF†RföÆÆ÷v–ær‚Fò&–çFVB&÷VæF'’âF†—2WF†VçF–6FW2&WW6&ÆRæf–vF–öâ&V6V—fW"Ö÷&R7G&öævÇ’'WBFöW2æ÷B&V6÷fW"Væ¶æ÷vâÆ–çFW‡Bâ"À§ÒÂçVÆÂÂ"’“°