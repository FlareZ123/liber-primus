"use strict";

/**
 * Full-chapter p33-39 word-shape crib gate for the source-selected 2013
 * TCP protocol and signed NEXT payload.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

/** @param {string} text */
function sha256(text) {
  return crypto.createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");
}

/** @param {string} text */
function gitBlobSha(text) {
  const body = Buffer.from(text, "utf8");
  return crypto.createHash("sha1")
    .update(Buffer.concat([Buffer.from("blob " + body.length + "\0"), body]))
    .digest("hex");
}

/** @param {string} url */
async function fetchText(url) {
  const response = await fetch(url);
  assert.equal(response.ok, true, "fetch failed " + response.status + " " + url);
  return response.text();
}

/** @param {string} raw */
function signedBody(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const start = normalized.indexOf("\n\n");
  assert.ok(start >= 0);
  return normalized.slice(start + 2)
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .replace(/^- /gm, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const units = corpus.translit.slice().sort((left, right) => right.length - left.length);

/** @param {string} text */
function sourceWords(text) {
  const matches = text.match(
    /(?<![A-Za-z0-9])[A-Za-z]+(?:['’][A-Za-z]+)*(?![A-Za-z0-9])/g
  ) || [];
  return matches.map((word) => {
    const normalized = word.toUpperCase().replace(/[^A-Z]/g, "")
      .replace(/QU/g, "CW")
      .replace(/V/g, "U")
      .replace(/K/g, "C")
      .replace(/Z/g, "S");
    const indices = [];
    for (let offset = 0; offset < normalized.length;) {
      const token = units.find((candidate) =>
        normalized.startsWith(candidate, offset)
      );
      assert.ok(token, "unmapped source word " + word);
      indices.push(corpus.translit.indexOf(token));
      offset += token.length;
    }
    return { word, indices };
  });
}

/** @param {string} raw */
function parseRuneWords(raw) {
  let current = [];
  let runeCount = 0;
  const words = [];
  const flush = () => {
    if (!current.length) return;
    words.push(current);
    current = [];
  };
  for (const character of raw) {
    if (runeSet.has(character)) {
      current.push(runeIndex.get(character));
      runeCount += 1;
    } else if (
      character === "/" ||
      character === "%" ||
      /\s/u.test(character)
    ) {
      // Physical wraps do not terminate a canonical printed word.
    } else {
      flush();
    }
  }
  flush();
  return { words, runeCount };
}

/**
 * @param {number[]} plain
 * @param {number[]} cipher
 */
function bijectionCompatible(plain, cipher) {
  assert.equal(plain.length, cipher.length);
  const forward = new Map();
  const reverse = new Map();
  for (let index = 0; index < plain.length; index += 1) {
    if (
      forward.has(plain[index]) &&
      forward.get(plain[index]) !== cipher[index]
    ) return false;
    if (
      reverse.has(cipher[index]) &&
      reverse.get(cipher[index]) !== plain[index]
    ) return false;
    forward.set(plain[index], cipher[index]);
    reverse.set(cipher[index], plain[index]);
  }
  return true;
}

/**
 * @param {{word:string,indices:number[]}[]} source
 * @param {number[][]} target
 */
function scan(source, target) {
  const sourceLengths = source.map((entry) => entry.indices.length);
  const targetLengths = target.map((word) => word.length);
  let best = {
    words: 0,
    runes: 0,
    sourceStart: -1,
    targetStart: -1,
    phrase: "",
    bijectionCompatible: false,
  };
  let qualifying = 0;
  let bijective = 0;

  for (let sourceStart = 0; sourceStart < source.length; sourceStart += 1) {
    for (let targetStart = 0; targetStart < target.length; targetStart += 1) {
      let count = 0;
      let runes = 0;
      while (
        sourceStart + count < source.length &&
        targetStart + count < target.length &&
        sourceLengths[sourceStart + count] === targetLengths[targetStart + count]
      ) {
        runes += sourceLengths[sourceStart + count];
        count += 1;
      }

      if (count > best.words || (count === best.words && runes > best.runes)) {
        const plain = source
          .slice(sourceStart, sourceStart + count)
          .flatMap((entry) => entry.indices);
        const cipher = target
          .slice(targetStart, targetStart + count)
          .flat();
        best = {
          words: count,
          runes,
          sourceStart,
          targetStart,
          phrase: source
            .slice(sourceStart, sourceStart + count)
            .map((entry) => entry.word)
            .join(" "),
          bijectionCompatible: count > 0 && bijectionCompatible(plain, cipher),
        };
      }

      if (count >= 12 && runes >= 40) {
        qualifying += 1;
        const plain = source
          .slice(sourceStart, sourceStart + count)
          .flatMap((entry) => entry.indices);
        const cipher = target
          .slice(targetStart, targetStart + count)
          .flat();
        if (bijectionCompatible(plain, cipher)) bijective += 1;
      }
    }
  }
  return { best, qualifying, bijective };
}

async function main() {
  const tcpUrl =
    "https://raw.githubusercontent.com/iBotPeaches/cicada_3301/" +
    "27309e66746e21542f2b908d7f60b906915fe7c6/other/2013_TCP_Server.md";
  const nextUrl =
    "https://raw.githubusercontent.com/iBotPeaches/cicada_3301/" +
    "a0a616d85717af59f8b806875b43d51e06e1e874/messages/2013/" +
    "do-not-share-this-information-2.asc";

  const [tcpMarkdown, nextRaw] = await Promise.all([
    fetchText(tcpUrl),
    fetchText(nextUrl),
  ]);

  assert.equal(
    gitBlobSha(tcpMarkdown),
    "485cebb92ec3fe3eaca6e9149af392ea0a3dc289"
  );
  assert.equal(
    sha256(nextRaw),
    "062886c6063b5c9c3049cf67dd9837df75bdd54d8fa73cb1b5fe25d52d227e87"
  );

  const codeBlock = tcpMarkdown.match(
    new RegExp("\\x60\\x60\\x60text\\r?\\n([\\s\\S]*?)\\r?\\n\\x60\\x60\\x60")
  );
  assert.ok(codeBlock);
  const tcpText = codeBlock[1].replace(/\r\n/g, "\n");
  const tcpNoLabels = tcpText.replace(/^[ \t]*[SC]:[ \t]*/gm, "");
  const koanPattern = /^A master who lived as a hermit[\s\S]*?^\.\s*$/m;
  assert.equal(koanPattern.test(tcpNoLabels), true);
  const tcpAuthored = tcpNoLabels.replace(koanPattern, "");

  const parts = transcription.replace(/\r/g, "").split("%");
  const p33to39 = parseRuneWords(parts.slice(33, 40).join("%"));
  assert.equal(p33to39.runeCount, 1680);
  assert.equal(p33to39.words.length, 378);

  const sources = [
    {
      name: "TCP authored protocol",
      words: sourceWords(tcpAuthored),
      expectedWords: 827,
      expectedRunes: 3519,
      expectedBest: {
        words: 6,
        runes: 21,
        phrase: "OK and then listen for text",
        compatible: false,
      },
    },
    {
      name: "signed NEXT payload",
      words: sourceWords(signedBody(nextRaw)),
      expectedWords: 404,
      expectedRunes: 1709,
      expectedBest: {
        words: 6,
        runes: 17,
        phrase: "come to an end We hope",
        compatible: false,
      },
    },
  ];

  const results = sources.map((source) => {
    assert.equal(source.words.length, source.expectedWords);
    assert.equal(
      source.words.reduce((total, word) => total + word.indices.length, 0),
      source.expectedRunes
    );
    const result = scan(source.words, p33to39.words);
    assert.equal(result.best.words, source.expectedBest.words);
    assert.equal(result.best.runes, source.expectedBest.runes);
    assert.equal(result.best.phrase, source.expectedBest.phrase);
    assert.equal(
      result.best.bijectionCompatible,
      source.expectedBest.compatible
    );
    assert.equal(result.qualifying, 0);
    assert.equal(result.bijective, 0);
    return {
      name: source.name,
      words: source.words.length,
      runes: source.expectedRunes,
      best: result.best,
      qualifying: result.qualifying,
      bijective: result.bijective,
    };
  });

  console.log(JSON.stringify({
    status: "PASS",
    target: {
      pages: "33-39",
      words: p33to39.words.length,
      runes: p33to39.runeCount,
    },
    results,
    decision: "no direct word-boundary-preserving TCP/NEXT plaintext crib",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
