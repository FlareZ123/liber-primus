"use strict";

// Deterministic, exact permutation-null benchmark for Agent10's p49–51
// base60/base59 signed-2016 MAP / ROAD / IS / THEIR recognition geometry.
// No ciphertext decoding is performed here.
//
// Null: independently permute all 32 physical rows and all 8 global columns.
// This retains each row's token inventory, each column's token inventory,
// and all same-row/same-column identities; it destroys only their global order.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const signed = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const words = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u).slice(1).join("\n")
  .split(/[^A-Za-z0-9]+/u).filter(w => /^[A-Za-z]+$/u.test(w))
  .map(w => w.toUpperCase());
const R = 32, C = 8;
const tape = grid.pages.flatMap(p => p.tokens);
const alpha60 = grid.alphabet, alpha59 = alpha60.replace("f", "");
assert.equal(tape.length, R * C);
assert.equal(alpha60.length, 60);
assert.equal(alpha59.length, 59);
const missing = [...alpha60].filter(x => !tape.join("").includes(x));
assert.deepEqual(missing, ["f"]);
assert.deepEqual(words.slice(17, 24),
  ["THE", "MAP", "THEIR", "MEANING", "IS", "THE", "ROAD"]);
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d*d <= n; d++) if (n%d === 0) return false;
  return true;
}
const rankOf = new Map();
for (let n = 2, k = 0; k < 64; n++) if (isPrime(n)) rankOf.set(n, ++k);
function decode(token, alphabet) {
  return alphabet.indexOf(token[0])*alphabet.length + alphabet.indexOf(token[1]);
}
const rank60 = tape.map(x => rankOf.get(decode(x, alpha60)) || null);
const rank59 = tape.map(x => rankOf.get(decode(x, alpha59)) || null);
const cell = (r,c) => r*C+c;
const rowsOf = (ranks, wanted, c) =>
  Array.from({length:R}, (_,r)=>r).filter(r=>ranks[cell(r,c)]===wanted);
const colsOf = (ranks, wanted, r) =>
  Array.from({length:C}, (_,c)=>c).filter(c=>ranks[cell(r,c)]===wanted);

// This code audits precisely the *source-phrase-conditioned* recognition
// reported by Agent10. It does not scan alternative word phrases/clock models.
const mapCol = 3, roadRow = 5;
const map17 = rowsOf(rank60, 17, mapCol);
const map18 = rowsOf(rank60, 18, mapCol);
const their19 = rowsOf(rank59, 19, mapCol);
const road22 = colsOf(rank59, 22, roadRow);
const road23 = colsOf(rank59, 23, roadRow);
assert.deepEqual(map17, [6,27]);
assert.deepEqual(map18, [26]);
assert.deepEqual(their19, [25]);
assert.deepEqual(road22, [0]);
assert.deepEqual(road23, [1]);
assert.equal(rank60[cell(roadRow, mapCol)], 21); // IS
assert.equal(rank60[cell(27, mapCol)], 17); // THE
assert.equal(rank60[cell(26, mapCol)], 18); // MAP, north of THE
assert.equal(rank59[cell(25, mapCol)], 19); // THEIR, north of MAP

// For a uniform permutation of R distinct rows, one specified row is
// immediately below another with probability 1/R. The two rank17 rows are
// distinct, so their mutually exclusive 'below rank18' events add.
// For a specified triple THEIR - MAP - THE in consecutive rows, a specified
// ordering of three distinct rows occurs with probability 1/(R*(R-1)).
// Independent global-column permutations put rank22 immediately left of
// rank23 with probability 1/C. The IS token is always at the crossing:
// global row/column permutations keep it at the intersection identically.
const belowCandidates = map17.length;
const columnOdds = 1/C;
const coreProbability = (belowCandidates/R) * columnOdds;
const extendedProbability = (belowCandidates/(R*(R-1))) * columnOdds;
assert.equal(coreProbability, 1/128);
assert.equal(extendedProbability, 1/3968);

console.log(JSON.stringify({
  null: "uniform independent permutations of physical rows and global columns",
  sources: ["resources/liber-primus/lp2-grid-256.json",
            "resources/historical/cicada2016-4gq25-outguess.asc"],
  sourceWordIndices: [17,18,19,21,22,23],
  geometry: {mapColumn:mapCol, map17Rows:map17, map18Rows:map18,
             their19Rows:their19, roadRow, road22Cols:road22,
             road23Cols:road23, intersectionToken:tape[cell(roadRow,mapCol)]},
  exactNull: {coreNumerator:1,coreDenominator:128,coreProbability,
              withTheirNumerator:1,withTheirDenominator:3968,
              withTheirProbability:extendedProbability},
  caveat: "Post-selected hypothesis and alternative readouts not charged; not a plaintext/key/receiver."
}, null, 2));
