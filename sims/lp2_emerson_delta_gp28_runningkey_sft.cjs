/**
 * LP2 source-anchored Emerson continuous GP28-delta running key.
 * Historical clue: 2014 Cicada used Emerson Self-Reliance as a book cipher.
 * This tests exactly one reversible anti-doublet architecture, not arbitrary
 * keys or arbitrary source works. Node 22, CommonJS, no dependencies.
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const REPO_EMERSON = "pnotisdev/cicada3301";
const SHA_EMERSON = "15200c67abee106913ba01ff504c5b6e88d16cc7";
const SHA_GIBRAN = "6ebc10889ae826388c63daaaf2fd2eb1d9f64e58";
const GPS = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const GP_TO_INDEX = new Map(GPS.map((x, i) => [x, i]));
const LIGATURES = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];
const N = 28;

/** @param {string} input @returns {number[]} */
function gpIndex(input) {
  const words = input.toUpperCase().match(/[A-Z]+/g) || [];
  const result = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const candidate = LIGATURES.find((ligature) => word.startsWith(ligature, i));
      const rune = candidate === "ING" ? "NG" : candidate || word[i];
      const index = GP_TO_INDEX.get(rune);
      if (index !== undefined) result.push(index);
      i += candidate ? candidate.length : 1;
    }
  }
  return result;
}

/** @param {string} repo @param {string} sha @param {string} path @returns {Promise<string>} */
async function fetchOriginal(repo, sha, path) {
  const url = "https://raw.githubusercontent.com/" + repo + "/" + sha + "/" + path;
  const response = await fetch(url, { headers: { "User-Agent": "lp2-emerson-original-running-key/1.0" } });
  assert.ok(response.ok, "HTTP " + response.status + " " + url);
  return response.text();
}

/** @param {number[]} native @returns {Float64Array} */
function languageModel(native) {
  const bins = new Float64Array(N * N);
  const marginal = new Float64Array(N);
  let previous = -1;
  for (const index of native) {
    if (index === 0) { previous = -1; continue; }
    const p = index - 1;
    if (previous !== -1) {
      bins[previous * N + p]++;
      marginal[previous]++;
    }
    previous = p;
  }
  const log = new Float64Array(N * N);
  for (let prev = 0; prev < N; prev++)for (let curr = 0; curr < N; curr++)
    log[prev * N + curr] = Math.log((bins[prev * N + curr] + 0.3) / (marginal[prev] + N * 0.3));
  return log;
}

/** @param {number[]} page @returns {{code:Int16Array,repeats:number}} */
function deltaCode(page) {
  const code = new Int16Array(page.length);
  let repeats = 0;
  code[0] = -1; // Unknown preceding ciphertext rune: do not guess an IV.
  for (let i = 1; i < page.length; i++) {
    const delta = (page[i] - page[i - 1] + 29) % 29;
    code[i] = delta ? delta - 1 : -1;
    repeats += Number(delta === 0);
  }
  return { code, repeats };
}

/**
 * @param {Int16Array} code
 * @param {number[]} key
 * @param {Float64Array} model
 * @param {number} offset
 * @param {number} sign
 * @returns {number}
 */
function score(code, key, model, offset, sign) {
  let sc = 0;
  let previous = -1;
  let transitions = 0;
  for (let i = 1; i < code.length; i++) {
    const delta = code[i];
    if (delta === -1) { previous = -1; continue; }
    const k = key[offset + i];
    let p = sign === 1 ? (delta + k) % N : (delta + N - k) % N;
    if (previous !== -1) {
      sc += model[previous * N + p];
      transitions++;
    }
    previous = p;
  }
  return transitions ? sc / transitions : -Infinity;
}

/**
 * @param {Int16Array} code
 * @param {number[]} key
 * @param {Float64Array} model
 * @param {number} sign
 * @returns {{value:number, offset:number}[]}
 */
function sweep(code, key, model, sign) {
  /** @type {{value:number,offset:number}[]} */
  const best = [];
  for (let i = 0; i + code.length <= key.length; i++) {
    const value = score(code, key, model, i, sign);
    if (best.length < 5 || value > best.at(-1).value) {
      best.push({ value, offset:i });
      best.sort((a,b) => b.value - a.value);
      if (best.length > 5) best.pop();
    }
  }
  return best;
}

/** @param {number[]} native @param {Float64Array} model @param {number} len @returns {number[]} */
function nativeScores(native, model, len) {
  // Preserve GP0=F and original window lengths. Language-model training
  // resets on F; removing F first would create artificial cross-F bigrams.
  const scores = [];
  for (let start = 0; start + len <= native.length; start += 29) {
    let total = 0, transitions = 0, previous = -1;
    for (let i = start; i < start + len; i++) {
      if (native[i] === 0) { previous = -1; continue; }
      const p = native[i] - 1;
      if (previous !== -1) {
        total += model[previous * N + p];
        transitions++;
      }
      previous = p;
    }
    assert.ok(transitions > 0, "control window has no usable GP28 bigrams");
    scores.push(total / transitions);
  }
  scores.sort((a,b)=>a-b);
  return scores;
}

/** @param {number} value @param {number[]} list @returns {number} */
function percentile(value, list) {
  let low = 0, hi = list.length;
  while (low < hi) {
    const mid = (low + hi) >> 1;
    if (list[mid] < value)low = mid + 1;else hi = mid;
  }
  return low / list.length;
}

async function main() {
  const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
  const [text, gibranText] = await Promise.all([
    fetchOriginal(REPO_EMERSON, SHA_EMERSON, "work/ref/emerson_essays1.txt"),
    fetchOriginal("GITenberg/The-Prophet_58585", SHA_GIBRAN, "58585-0.txt"),
  ]);
  console.log("INPUT sha256 emerson=" + crypto.createHash("sha256").update(text).digest("hex") + " bytes=" + Buffer.byteLength(text));
  console.log("INPUT sha256 gibran=" + crypto.createHash("sha256").update(gibranText).digest("hex") + " bytes=" + Buffer.byteLength(gibranText));
  const keyGP = gpIndex(text);
  const originalKey = keyGP.map((x) => x % N);
  const reversedKey = originalKey.slice().reverse();
  const gibran = gpIndex(gibranText);
  const model = languageModel(gibran);
  const lp1Text = fs.readFileSync("resources/liber-primus/lp1-plaintext-reference.txt", "utf8")
    .split("### 56")[0].split(/\r?\n/).filter((line) =>
      !line.trimStart().startsWith("#") && !line.trimStart().startsWith("[")).join(" ");
  const independentLP1 = gpIndex(lp1Text);
  console.log("CORPUS keyGP=" + keyGP.length + " gibranGP=" + gibran.length +
    " firstPageRunes=" + corpus.pages[0].indices.length);

  // Unit test with authentic published language and secret offset into the
  // unchanged source book, using exactly the declared nonzero-delta transform.
  const plant = gibran.filter((x) => x !== 0).slice(400, 662).map((x) => x - 1);
  assert.equal(plant.length, 262);
  const cipher = [];
  let previous = 5;
  for (let i = 0; i < plant.length; i++) {
    const delta = 1 + (plant[i] + originalKey[355 + i]) % N;
    previous = (previous + delta) % 29;
    cipher.push(previous);
  }
  const planted = deltaCode(cipher);
  assert.equal(planted.repeats, 0);
  for (let i = 1; i < plant.length; i++)
    assert.equal((planted.code[i] + N - originalKey[355 + i]) % N, plant[i], "Exact plant decipherment at rune " + i);
  const positiveScore = score(planted.code, originalKey, model, 355, -1);
  console.log("PASS positive synthetic hidden-key plant: 261/261 native GP28 symbols exact; bigram score=" + positiveScore);

  const tests = [
    {page:0,label:"p0 262-runic opening",keyN:262},
    {page:55,label:"p55 76-runic ending",keyN:76},
  ];
  const summary = [];
  for (const test of tests) {
    const original = corpus.pages[test.page].indices;
    assert.equal(original.length, test.keyN);
    const { code, repeats } = deltaCode(original);
    const nativeDistribution = nativeScores(gibran, model, original.length);
    const independentDistribution = nativeScores(independentLP1, model, original.length);
    assert.ok(independentDistribution.length > 0);
    const outcomes = [];
    for (const keySource of [
      { direction:"forward", values:originalKey },
      { direction:"reverse", values:reversedKey },
    ]) {
      for (const sign of [-1, 1]) {
        const leaders = sweep(code, keySource.values, model, sign);
        outcomes.push({ direction:keySource.direction, sign, ...leaders[0], runnersUp:leaders.slice(1,3)});
      }
    }
    outcomes.sort((a,b)=>b.value-a.value);
    const leader = outcomes[0];
    const rec = {
      page:test.page, runeCount:original.length, adjacentRepeatedRuneExceptions:repeats,
      nativeSourceWindows:nativeDistribution.length,
      nativeMin:nativeDistribution[0],
      nativeP05:nativeDistribution[Math.floor(0.05*nativeDistribution.length)],
      nativeMedian:nativeDistribution[Math.floor(0.5*nativeDistribution.length)],
      independentLP1Windows:independentDistribution.length,
      independentLP1Min:independentDistribution[0],
      independentLP1Median:independentDistribution[Math.floor(0.5*independentDistribution.length)],
      leader, leaderRankAmongNative:percentile(leader.value,nativeDistribution),
      leaderRankAmongIndependentLP1:percentile(leader.value,independentDistribution),
      allFamilies:outcomes
    };
    console.log("ORIGINAL_RESULT " + JSON.stringify(rec));
    summary.push(rec);
  }
  console.log("SUMMARY " + JSON.stringify({model:"C[i]-C[i-1] = 1 + (P[i] ± K[offset+i] mod 28) mod29", key:"Cicada-2014 selected Emerson Essays I running text", testedPages:tests.length, outcomes:summary.map(x=>({page:x.page,repeat:x.adjacentRepeatedRuneExceptions,best:x.leader.value,percentile:x.leaderRankAmongNative}))}));
}
main().catch((err)=>{console.error(err);process.exitCode=1;});
