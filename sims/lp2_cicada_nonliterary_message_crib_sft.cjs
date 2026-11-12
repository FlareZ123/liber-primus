#!/usr/bin/env node
"use strict";

// Source-authenticated, finite word-shape/equality gate for newly screened
// 2013–2014 Cicada messages. External source bytes are fetched in memory only.

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const sha256 = (s) => crypto.createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
const gitBlobSha = (s) => {
  const b = Buffer.from(s, "utf8");
  return crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob " + b.length + "\0"), b])).digest("hex");
};

async function fetchText(url) {
  const response = await fetch(url);
  assert(response.ok, "fetch failed " + response.status + " " + url);
  return response.text();
}

function verifyBytes(name, content, expected) {
  assert.equal(Buffer.byteLength(content, "utf8"), expected.bytes, name + " byte count");
  assert.equal(sha256(content), expected.sha256, name + " SHA-256");
  assert.equal(gitBlobSha(content), expected.gitBlob, name + " Git blob SHA-1");
}

function findSignature(inventory, expected) {
  const row = inventory.messages.find((x) => x.file === expected.file);
  assert(row, "missing signature inventory row: " + expected.file);
  assert.equal(row.signature_status, "VALID", expected.file + " signature status");
  assert.equal(row.signature_timestamp_utc, expected.timestamp, expected.file + " timestamp");
  assert.equal(row.sig_id, expected.sigId, expected.file + " signature ID");
  assert.equal(row.sha256, expected.sha256, expected.file + " inventory SHA-256");
  assert.equal(row.bytes, expected.bytes, expected.file + " inventory byte count");
  assert.equal(row.duplicate_of ?? null, expected.duplicateOf ?? null, expected.file + " duplicate relation");
  return row;
}

function signedBody(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const marker = "-----BEGIN PGP SIGNED MESSAGE-----";
  const start = normalized.indexOf(marker);
  assert(start >= 0, "missing clear-signed PGP header");
  const bodyStart = normalized.indexOf("\n\n", start);
  assert(bodyStart >= 0, "missing clear-signed body separator");
  return normalized.slice(bodyStart + 2).split("-----BEGIN PGP SIGNATURE-----")[0].replace(/^- /gm, "");
}

function sourceWords(text, translit) {
  // Whole alphabetic words only. Alphanumeric protocol/data tokens such as
  // BASE29 and 3QO are not prose words; C:/S: labels are tested separately.
  const matches = text.match(/(?<![A-Za-z0-9])[A-Za-z]+(?:['’][A-Za-z]+)*(?![A-Za-z0-9])/g) || [];
  const units = translit.slice().sort((a, b) => b.length - a.length);
  return matches.map((word) => {
    const normalized = word.toUpperCase().replace(/[^A-Z]/g, "")
      .replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    const indices = [];
    for (let i = 0; i < normalized.length;) {
      const token = units.find((u) => normalized.startsWith(u, i));
      assert(token, "unmapped GP token in " + word + " at " + normalized.slice(i));
      indices.push(translit.indexOf(token));
      i += token.length;
    }
    return { word, indices };
  });
}

function parseOriginalLp2(raw, runeIndex, runeSet) {
  // Match the page-wrap handling used by the repository's frozen quote scripts.
  const source = raw.replace(/\r/g, "").split("%").slice(0, 55).join("%");
  let offset = 0;
  let current = "";
  let start = 0;
  const words = [];
  const flush = () => {
    if (!current) return;
    words.push({ start, end: offset, indices: [...current].map((r) => runeIndex.get(r)) });
    current = "";
  };
  for (const ch of source) {
    if (runeSet.has(ch)) {
      if (!current) start = offset;
      current += ch;
      offset++;
    } else if (ch === "/" || ch === "%" || /\s/u.test(ch)) {
      // line wraps, page wraps, and whitespace do not terminate a printed word
    } else {
      flush();
    }
  }
  flush();
  return { words, runeCount: offset };
}

function bijectionCompatible(plain, cipher) {
  if (plain.length !== cipher.length) return false;
  const forward = new Map();
  const reverse = new Map();
  for (let i = 0; i < plain.length; i++) {
    if (forward.has(plain[i]) && forward.get(plain[i]) !== cipher[i]) return false;
    if (reverse.has(cipher[i]) && reverse.get(cipher[i]) !== plain[i]) return false;
    forward.set(plain[i], cipher[i]);
    reverse.set(cipher[i], plain[i]);
  }
  return true;
}

function scanSource(source, quotes) {
  const perQuote = quotes.map((quote) => {
    const sourceLengths = source.map((w) => w.indices.length);
    let best = { words: 0, runes: 0, sourceStart: -1, targetStart: -1, phrase: "", bijectionCompatible: false };
    let fullQuoteShapeMatches = 0;
    let qualifyingMatches = 0;
    let bijectiveSurvivors = 0;

    for (let targetStart = 0; targetStart < quote.words.length; targetStart++) {
      for (let sourceStart = 0; sourceStart < source.length; sourceStart++) {
        let n = 0;
        let runeCount = 0;
        while (targetStart + n < quote.words.length &&
               sourceStart + n < source.length &&
               quote.lengths[targetStart + n] === sourceLengths[sourceStart + n]) {
          runeCount += quote.lengths[targetStart + n];
          n++;
        }
        if (targetStart === 0 && n === quote.words.length) fullQuoteShapeMatches++;
        if (n > best.words || (n === best.words && runeCount > best.runes)) {
          const plain = source.slice(sourceStart, sourceStart + n).flatMap((w) => w.indices);
          const cipher = quote.words.slice(targetStart, targetStart + n).flat();
          best = {
            words: n, runes: runeCount, sourceStart, targetStart,
            phrase: source.slice(sourceStart, sourceStart + n).map((w) => w.word).join(" "),
            bijectionCompatible: n > 0 && bijectionCompatible(plain, cipher)
          };
        }
        if (n >= 12 && runeCount >= 40) {
          qualifyingMatches++;
          const plain = source.slice(sourceStart, sourceStart + n).flatMap((w) => w.indices);
          const cipher = quote.words.slice(targetStart, targetStart + n).flat();
          if (bijectionCompatible(plain, cipher)) bijectiveSurvivors++;
        }
      }
    }
    return {
      quoteIndex: quote.index, quoteWords: quote.lengths.length, quoteRunes: quote.flat.length,
      best, fullQuoteShapeMatches, qualifyingMatches, bijectiveSurvivors
    };
  });
  const maxRun = perQuote.reduce((best, item) =>
    item.best.words > best.words || (item.best.words === best.words && item.best.runes > best.runes)
      ? { ...item.best, quoteIndex: item.quoteIndex } : best,
    { words: 0, runes: 0, phrase: "", quoteIndex: -1, bijectionCompatible: false });
  return {
    sourceWords: source.length,
    sourceRunes: source.reduce((n, w) => n + w.indices.length, 0),
    maxRun,
    qualifyingMatches: perQuote.reduce((n, q) => n + q.qualifyingMatches, 0),
    bijectiveSurvivors: perQuote.reduce((n, q) => n + q.bijectiveSurvivors, 0),
    perQuote
  };
}

function scanPlant(source, targetWords) {
  let best = { words: 0, runes: 0, sourceStart: -1, targetStart: -1, bijectionCompatible: false };
  for (let targetStart = 0; targetStart < targetWords.length; targetStart++) {
    for (let sourceStart = 0; sourceStart < source.length; sourceStart++) {
      let n = 0;
      let runeCount = 0;
      while (targetStart + n < targetWords.length &&
             sourceStart + n < source.length &&
             targetWords[targetStart + n].length === source[sourceStart + n].indices.length) {
        runeCount += targetWords[targetStart + n].length;
        n++;
      }
      if (n > best.words || (n === best.words && runeCount > best.runes)) {
        const plain = source.slice(sourceStart, sourceStart + n).flatMap((w) => w.indices);
        const cipher = targetWords.slice(targetStart, targetStart + n).flat();
        best = { words: n, runes: runeCount, sourceStart, targetStart,
          bijectionCompatible: n > 0 && bijectionCompatible(plain, cipher) };
      }
    }
  }
  return best;
}

async function main() {
  const inventoryUrl = "https://raw.githubusercontent.com/Dukotah/cicada3301/06d5c93bc56b8b9cb24416e98d81fc2569f99f75/corpus/A-primary-artifacts/SIGNATURES.json";
  const tcpBase = "https://raw.githubusercontent.com/iBotPeaches/cicada_3301/27309e66746e21542f2b908d7f60b906915fe7c6/";
  const archive2014 = "https://raw.githubusercontent.com/iBotPeaches/cicada_3301/a0a616d85717af59f8b806875b43d51e06e1e874/";
  const [inventoryRaw, tcpAsc, tcpTranscript, helloRaw, privateRaw, squareRaw] = await Promise.all([
    fetchText(inventoryUrl),
    fetchText(tcpBase + "messages/2013/tcp-server.asc"),
    fetchText(tcpBase + "other/2013_TCP_Server.md"),
    fetchText(archive2014 + "messages/2014/hello-you-have-done-well.asc"),
    fetchText(archive2014 + "messages/2014/the-work-of-a-private-man.asc"),
    fetchText(archive2014 + "messages/2014/liber_primus/10.jpg.asc")
  ]);
  const inventory = JSON.parse(inventoryRaw);

  const expected = {
    tcp: { file: "ibotpeaches/messages/2013/tcp-server.asc", timestamp: "2013-01-26T09:16:23Z",
      sigId: "gfTLegjau+BeVXHzCy6uxb+92fg", sha256: "fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c",
      bytes: 3775, gitBlob: "c540174ff660299e24dd0ae6f390743753ce4a72", duplicateOf: null },
    privateMan: { file: "ibotpeaches/messages/2014/the-work-of-a-private-man.asc", timestamp: "2014-01-06T04:59:26Z",
      sigId: "SyvqR5vwCNGds2E0b+KA3L4DU0A", sha256: "cba64781bd461b17039316ef97426f912aae987fde131f62e883f7f9e9f0118e",
      bytes: 1150, gitBlob: "1f9a61b97d5de9c4ca57402c064365a503d956a9", duplicateOf: "pgp/messages/2014-01-opening-book-code.asc" },
    square: { file: "ibotpeaches/messages/2014/liber_primus/10.jpg.asc", timestamp: "2014-01-19T07:39:32Z",
      sigId: "PxBW8To/8sh2VNKnCFAE0ZwKzBI", sha256: "56467e78411358a236479a867a073de1a6fe9be2572e19759be1128968b3feeb",
      bytes: 1234, gitBlob: "0f24ac3146f6c91df23e211e8588f6e9b67b6dce", duplicateOf: "pgp/messages/2014-01-magic-square-upload-outguess-10.asc" },
    hello: { file: "ibotpeaches/messages/2014/hello-you-have-done-well.asc", timestamp: "2014-01-25T08:26:57Z",
      sigId: "K9IGj2g73eIXtAYQlEKfRPB5c7o", sha256: "361563f8faec12359c87646593a36eaff0de93e947992e5ae4462356030b95c8",
      bytes: 1351, gitBlob: "14470df9fd76f4d1599ab12e63b77d1a143d46af", duplicateOf: "pgp/messages/2014-01-upload-instructions.asc" }
  };

  const tcpSig = findSignature(inventory, expected.tcp);
  const privateSig = findSignature(inventory, expected.privateMan);
  const squareSig = findSignature(inventory, expected.square);
  const helloSig = findSignature(inventory, expected.hello);
  verifyBytes("2013 tcp-server.asc", tcpAsc, expected.tcp);
  verifyBytes("2014 private-man.asc", privateRaw, expected.privateMan);
  verifyBytes("2014 10.jpg.asc", squareRaw, expected.square);
  verifyBytes("2014 hello-you-have-done-well.asc", helloRaw, expected.hello);

  const transcriptExpected = "485cebb92ec3fe3eaca6e9149af392ea0a3dc289";
  assert.equal(gitBlobSha(tcpTranscript), transcriptExpected, "upstream TCP plaintext transcription Git blob SHA");
  const codeBlock = tcpTranscript.match(new RegExp("\\x60\\x60\\x60text\\r?\\n([\\s\\S]*?)\\r?\\n\\x60\\x60\\x60"));
  assert(codeBlock, "TCP plaintext transcription code block");
  const tcpText = codeBlock[1].replace(/\r\n/g, "\n");
  const tcpNoLabels = tcpText.replace(/^[ \t]*[SC]:[ \t]*/gm, "");
  const koanPattern = /^A master who lived as a hermit[\s\S]*?^\.\s*$/m;
  assert(koanPattern.test(tcpNoLabels), "TCP embedded KOAN boundary");
  const tcpNoKoan = tcpNoLabels.replace(koanPattern, "");

  const sourceNote = read("resources/external/2013-tcp-server-signed-source.md");
  assert(sourceNote.includes(expected.tcp.sha256), "local TCP source note pins raw artifact hash");
  assert(sourceNote.includes("6D854CD7933322A601C3286D181F01E57A35090F"), "local TCP source note pins signing fingerprint");

  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const quoteMeta = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
  const transcript = read("resources/liber-primus/lp2-transcription.txt");
  const runeSet = new Set(corpus.runes);
  const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const original = parseOriginalLp2(transcript, runeIndex, runeSet);
  assert.equal(original.runeCount, 12956, "original LP2 rune count");
  assert.equal(original.words.length, 2896, "original LP2 printed word count");

  const expectedShapes = [
    [6,3,3,6],
    [3,3,4,5,4],
    [3,9],
    [5,7,2,3,4,6,4,3,3,4,4,4,5,4],
    [9,8,3,4,6,3,10,2,4,7,6,2,4],
    [4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5],
    [5,7,2,3,4,10,3,9,7,3,7,4,3,3]
  ];
  assert.equal(quoteMeta.quotes.length, expectedShapes.length, "seven frozen quote spans");
  const quotes = quoteMeta.quotes.map((q, index) => {
    const words = original.words.filter((w) => w.start >= q.start && w.end <= q.end);
    assert.equal(words[0]?.start, q.start, "quote " + index + " start boundary");
    assert.equal(words.at(-1)?.end, q.end, "quote " + index + " end boundary");
    const lengths = words.map((w) => w.indices.length);
    assert.deepEqual(lengths, expectedShapes[index], "quote " + index + " frozen GP/ING shape");
    return { index, start: q.start, end: q.end, words: words.map((w) => w.indices), lengths,
      flat: words.flatMap((w) => w.indices) };
  });

  const tcpWithLabels = sourceWords(tcpText, corpus.translit);
  const tcpWithoutLabels = sourceWords(tcpNoLabels, corpus.translit);
  const tcpAuthoredOnly = sourceWords(tcpNoKoan, corpus.translit);
  const helloWords = sourceWords(signedBody(helloRaw), corpus.translit);
  const squareWords = sourceWords(signedBody(squareRaw), corpus.translit);
  const privateBody = signedBody(privateRaw);
  const privateWords = sourceWords(privateBody, corpus.translit);
  const stanza = privateBody.match(/The work of a private man[\s\S]*?to produce from within\./i);
  assert(stanza, "private-man stanza boundary");
  const privateStanzaWords = sourceWords(stanza[0], corpus.translit);

  const sources = [
    { name: "2013 TCP full signed text (C:/S: labels retained; KOAN retained)", words: tcpWithLabels, signature: tcpSig },
    { name: "2013 TCP full signed text (labels removed; KOAN retained)", words: tcpWithoutLabels, signature: tcpSig },
    { name: "2013 TCP authored protocol (labels and 67-word KOAN removed)", words: tcpAuthoredOnly, signature: tcpSig },
    { name: "2014 upload instructions after magic squares", words: helloWords, signature: helloSig },
    { name: "2014 Stage04 magic-square upload instruction", words: squareWords, signature: squareSig },
    { name: "2014 private-man full signed body", words: privateWords, signature: privateSig },
    { name: "2014 private-man stanza only (authorship not independently established)", words: privateStanzaWords, signature: privateSig }
  ];

  const results = sources.map((source) => {
    const result = scanSource(source.words, quotes);
    assert.equal(result.qualifyingMatches, 0, source.name + " qualifying word-length matches");
    assert.equal(result.bijectiveSurvivors, 0, source.name + " fixed-monoalphabetic survivors");
    for (const q of result.perQuote.filter((x) => x.quoteIndex >= 3)) {
      assert.equal(q.fullQuoteShapeMatches, 0, source.name + " full long quote shape " + q.quoteIndex);
    }
    return {
      name: source.name,
      signatureTimestamp: source.signature.signature_timestamp_utc,
      signatureId: source.signature.sig_id,
      signatureStatus: source.signature.signature_status,
      sourceWords: result.sourceWords,
      sourceRunes: result.sourceRunes,
      maxRun: result.maxRun,
      qualifyingMatches: result.qualifyingMatches,
      bijectiveSurvivors: result.bijectiveSurvivors,
      perQuote: result.perQuote
    };
  });

  const forest = sourceWords(signedBody(read("resources/historical/cicada2013-forest-clue.asc")), corpus.translit);
  const plant = forest.slice(0, 12);
  const plantPlain = plant.flatMap((w) => w.indices);
  const permutation = (x) => (7 * x + 3) % 29;
  assert.equal(plant.length, 12, "positive plant word count");
  assert.equal(plantPlain.length, 46, "positive plant rune count");
  assert.equal(new Set(Array.from({ length: 29 }, (_, x) => permutation(x))).size, 29, "positive plant is a bijection");
  const plantedTarget = plant.map((w) => w.indices.map(permutation));
  const plantScan = scanPlant(plant, plantedTarget);
  assert.equal(plantScan.words, 12, "positive plant detected word count");
  assert.equal(plantScan.runes, 46, "positive plant detected rune count");
  assert.equal(plantScan.bijectionCompatible, true, "positive plant equality pattern");

  const mutatedFlat = plantedTarget.flat();
  const repeatedPosition = plantPlain.findIndex((v, i) => plantPlain.indexOf(v) !== i);
  assert(repeatedPosition >= 0, "positive plant contains repeated plaintext rune");
  const repeatedPlain = plantPlain[repeatedPosition];
  const otherPlain = plantPlain.find((v) => v !== repeatedPlain);
  mutatedFlat[repeatedPosition] = permutation(otherPlain);
  assert(!bijectionCompatible(plantPlain, mutatedFlat), "mutated repeated-rune mapping rejected");

  console.log(JSON.stringify({
    corpus: "four newly screened source messages; seven frozen LP2 quote spans",
    normalization: "QU->CW, V->U, K->C, Z->S; greedy canonical GP transliteration including ING",
    wordBoundaryRule: "alphabetic words not embedded in alphanumeric tokens; TCP C:/S: labels tested with and without",
    threshold: "at least 12 consecutive words and 40 original GP runes",
    sources: results,
    decision: "No qualifying source-aligned crib; no fixed reversible monoalphabetic candidate",
    positivePlant: {
      source: "authenticated 2013 forest clue",
      words: 12, runes: 46, permutation: "c=(7p+3) mod 29",
      detected: true, bijectionCompatible: true, mutatedMappingRejected: true
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
