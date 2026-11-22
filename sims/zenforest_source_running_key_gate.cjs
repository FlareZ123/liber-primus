"use strict";
/**
 * Source-directed A Zen Forest / Cicada signed-text running-key gate.
 *
 * Run from repository root:
 * node sims/zenforest_source_running_key_gate.cjs \
 *   /tmp/zenforest-introduction-candidate.txt \
 *   /tmp/zenforest-items-613-626.txt \
 *   /tmp/zenforest-items-614-616.txt \
 *   /tmp/zenforest-items-612-626.txt
 *
 * The external book excerpts are deliberately not committed. They are
 * identified by source coordinates in im-results/zenforest-source-gate.md.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");

const [prefacePath, sourceKeyPath, sourceCribPath, wrongSourceKeyPath] =
  process.argv.slice(2);
if (!prefacePath || !sourceKeyPath || !sourceCribPath || !wrongSourceKeyPath) {
  console.error("Usage: node sims/zenforest_source_running_key_gate.cjs <preface-p3.txt> <items-613-626.txt> <items-614-616.txt> <items-612-626.txt>");
  process.exit(2);
}

const GP = [
  "F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S",
  "T","B","E","M","L","ING","OE","D","A","AE","Y","IO","EA"
];
const units = GP.map((s,i) => [s,i]).sort((a,b) => b[0].length-a[0].length);
const mod = n => ((n % 29) + 29) % 29;

function tokenize(sourceText) {
  let text = sourceText.toUpperCase()
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  while (text.length) {
    const unit = units.find(([spelling]) => text.startsWith(spelling));
    assert.ok(unit, "Unmapped GP source text near: " + text.slice(0,24));
    out.push(unit[1]);
    text = text.slice(unit[0].length);
  }
  return out;
}

function clearSignedBody(file) {
  const raw = fs.readFileSync(file, "utf8");
  const begin = raw.indexOf("-----BEGIN PGP SIGNED MESSAGE-----");
  const end = raw.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(begin >= 0 && end > begin, "Expected clear-signed PGP source: " + file);
  const signedBlock = raw.slice(begin + "-----BEGIN PGP SIGNED MESSAGE-----".length, end);
  const separator = signedBlock.indexOf("\n\n");
  assert.ok(separator >= 0, "Missing clear-signature header separator: " + file);
  return signedBlock.slice(separator + 2);
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s,n) => s+n*(n-1),0) / (values.length*(values.length-1));
}
function render(values) {
  return values.map(x => GP[x]).join(" ");
}
function decode(cipher, key, sign) {
  const n = Math.min(cipher.length,key.length);
  const plain = cipher.slice(0,n).map((c,i) => mod(c + sign*key[i]));
  const reencrypted = plain.map((p,i) => mod(p - sign*key[i]));
  assert.deepEqual(reencrypted,cipher.slice(0,n),"Exact re-encryption failed");
  return plain;
}
function mismatchCount(actual, expected) {
  assert.equal(actual.length,expected.length);
  return actual.reduce((n,x,i) => n+(x===expected[i]?0:1),0);
}
function fixedClockHits(cipher,key,plain,sign) {
  const hits = [];
  for (let offset=0; offset+plain.length<=Math.min(cipher.length,key.length); offset++) {
    let match = true;
    for (let j=0;j<plain.length;j++) {
      if (cipher[offset+j] !== mod(plain[j] + sign*key[offset+j])) {
        match = false; break;
      }
    }
    if (match) hits.push(offset);
  }
  return hits;
}
function controlRoundTrip(knownPlain,key,sign) {
  const syntheticCipher = knownPlain.map((p,i) => mod(p-sign*key[i]));
  const recovered = syntheticCipher.map((c,i) => mod(c+sign*key[i]));
  assert.deepEqual(recovered,knownPlain);
  return true;
}

const corpus = JSON.parse(fs.readFileSync(
  "resources/liber-primus/lp2-corpus.json","utf8"
));
const page = n => {
  const p = corpus.pages.find(x => x.page===n);
  assert.ok(p,"Missing canonical LP2 page "+n);
  return p.indices;
};
const p40 = page(40), p41 = page(41), p57 = page(57);
const p40p41 = p40.concat(p41);
assert.equal(p40.length,231);
assert.equal(p41.length,273);
assert.equal(p40p41.length,504);
assert.equal(p57.length,95);

const preface = tokenize(fs.readFileSync(prefacePath,"utf8"));
const bookKey = tokenize(fs.readFileSync(sourceKeyPath,"utf8"));
const bookCrib = tokenize(fs.readFileSync(sourceCribPath,"utf8"));
const wrongBookKey = tokenize(fs.readFileSync(wrongSourceKeyPath,"utf8"));
assert.equal(preface.length,128,"Shigematsu introduction candidate length changed");
assert.equal(bookKey.length,589,"A Zen Forest items 613-626 transcription changed");
assert.equal(bookCrib.length,124,"A Zen Forest items 614-616 transcription changed");
assert.equal(wrongBookKey.length,583,"A Zen Forest items 612-626 control length changed");

const selected2016 = tokenize(clearSignedBody(
  "resources/historical/cicada2016-4gq25-outguess.asc"
));
const wrong2013 = tokenize(clearSignedBody(
  "resources/external/2013-do-not-share-this-information-2.asc"
));
const forestControl = tokenize(clearSignedBody(
  "resources/historical/cicada2013-forest-clue.asc"
));
const cicada2013Candidate = tokenize(clearSignedBody(
  "resources/historical/cicada2013-second-onion-everything-you-need.asc"
));
const cicada2016Candidate = selected2016;
assert.equal(selected2016.length,184);
assert.equal(wrong2013.length,1680);
assert.equal(forestControl.length,56);
assert.equal(cicada2013Candidate.length,98);
assert.equal(cicada2016Candidate.length,184);

const prefaceTests = [];
for (const [name,key] of [
  ["selected-2016-signed-message",selected2016],
  ["wrong-2013-do-not-share-message",wrong2013],
  ["wrong-2013-forest-clue",forestControl]
]) {
  for (const sign of [-1,1]) {
    const plain = decode(p40,key,sign);
    const predicted = preface.map((p,i) => mod(p+sign*key[i]));
    const compared = Math.min(preface.length,p40.length,key.length);
    prefaceTests.push({
      key:name,sign,keyLength:key.length,decodedLength:plain.length,
      decodedIoC:ioc(plain),
      candidateCompared:compared,
      candidateMismatches:mismatchCount(
        p40.slice(0,compared),predicted.slice(0,compared)
      ),
      candidateExactHitsUnderFixedClock:fixedClockHits(p40p41,key,preface,sign),
      p40Prefix:render(plain.slice(0,100)),
      roundTrip:true
    });
  }
}

const bookTests = [];
for (const [name,key] of [
  ["selected-A-Zen-Forest-613-to-626",bookKey],
  ["wrong-A-Zen-Forest-612-to-626",wrongBookKey]
]) {
  for (const sign of [-1,1]) {
    const plain = decode(p40p41,key,sign);
    const predicted = bookCrib.map((p,i) => mod(p+sign*key[i]));
    const p13Predicted = cicada2013Candidate.map((p,i) => mod(p+sign*key[i]));
    const p16Predicted = cicada2016Candidate.map((p,i) => mod(p+sign*key[i]));
    bookTests.push({
      key:name,sign,keyLength:key.length,decodedLength:plain.length,
      decodedIoC:ioc(plain),
      candidateLength:bookCrib.length,
      candidateMismatches:mismatchCount(p40.slice(0,bookCrib.length),predicted),
      prefaceCandidateMismatches:mismatchCount(p40.slice(0,preface.length),preface.map((p,i)=>mod(p+sign*key[i]))),
      prefaceCandidateFixedClockHits:fixedClockHits(p40p41,key,preface,sign),
      bookCribFixedClockHits:fixedClockHits(p40p41,key,bookCrib,sign),
      cicada2013CandidateLength:cicada2013Candidate.length,
      cicada2013CandidateMismatches:mismatchCount(p40.slice(0,cicada2013Candidate.length),p13Predicted),
      cicada2013FixedClockHits:fixedClockHits(p40p41,key,cicada2013Candidate,sign),
      cicada2016CandidateLength:cicada2016Candidate.length,
      cicada2016CandidateMismatches:mismatchCount(p40.slice(0,cicada2016Candidate.length),p16Predicted),
      cicada2016FixedClockHits:fixedClockHits(p40p41,key,cicada2016Candidate,sign),
      p40Prefix:render(plain.slice(0,100)),
      p41Prefix:render(plain.slice(p40.length,p40.length+100)),
      roundTrip:true
    });
  }
}

const p57Control = {
  knownPage:57,knownPlaintextRunes:p57.length,ioc:ioc(p57),
  selected2016BothSigns:[-1,1].every(s => controlRoundTrip(p57,selected2016,s)),
  bookKeyBothSigns:[-1,1].every(s => controlRoundTrip(p57,bookKey,s))
};

console.log(JSON.stringify({
  gp29:GP,
  sourceLengths:{
    selected2016SignedKey:selected2016.length,
    shigematsuIntroductionCandidate:preface.length,
    zenForestItems613to626RunningKey:bookKey.length,
    zenForestItems614to616Candidate:bookCrib.length,
    wrongZenForestItems612to626:wrongBookKey.length,
    wrong2013SignedMessage:wrong2013.length,
    wrong2013ForestClue:forestControl.length,
    cicada2013PlaintextCandidate:cicada2013Candidate.length,
    cicada2016PlaintextCandidate:cicada2016Candidate.length
  },
  target:{
    p40:p40.length,p41:p41.length,p40p41:p40p41.length,
    p40p41RawIoC:ioc(p40p41),p57SolvedControlIoC:ioc(p57)
  },
  prefaceTests,
  bookTests,
  p57Control
},null,2));
