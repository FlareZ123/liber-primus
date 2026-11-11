# p50 second-column rank map and the p32 M7 fixed points

**Status:** reproducible structural correspondence; not plaintext, a key, or a validated decipherment.

## Construction

The canonical corpus and ink annotations give 31 thirteen-dot events across LP2. Keeping coincident events as separate boundaries yields 32 chronological intervals. Intervals **#9** and **#12** are empty (the p7 co-located black/red marks and the p14/p15 page-boundary pair); the remaining **30** intervals are nonempty.

The p50 numeric grid is 32 rows × 8 columns. Its per-column distinct-value counts are:

`[30, 32, 30, 30, 30, 31, 31, 30]`

Thus the **second column is the only all-distinct column**. I checked its 32 glyph tokens against the original JPEGs 66–68; in particular, table row 19 reads `3U` (=210) and row 22 reads `3m` (=228).

Use the simplest alignment: chronological fragment (i) corresponds to numeric-table row (i). Omit the two empty intervals and sort the 30 remaining rows by their second-column byte in ascending order. This assigns each nonempty fragment one rank in (0,ldots,29), the 30 points of (P^1(\mathbb F_{29})=\mathbb F_{29}\cup\{\infty\}).

## Exact M7 cross-link

The source-supported p32 projectivity is

[
M_7=\begin{pmatrix}14&25\\25&28\end{pmatrix},
\qquad x\longmapsto\frac{14x+25}{25x+28}\pmod{29}.
]

Its fixed points are ranks **22** and **25**. Its eigenvalues are 27 and 15, so the eigenvalue-ratio pair is **{25, 7}** (the two reciprocal ratios).

Under the rank map above:

| Projective rank | Fragment | Fragment location | p50 second-column byte | Base-29 quotient/remainder |
|---:|---:|---|---:|---:|
| 22 | 19 | p27–p32 | 210 | (7,7) |
| 25 | 22 | p33 second red heading (8 runes) | 228 | (7,25) |

Indeed, (210=7\cdot29+7) and (228=7\cdot29+25). The two remainders are exactly the M7 eigenvalue-ratio pair, and both quotients equal its order, 7. The selected fragments also anchor the p32/p33 transition: fragment 19 contains p32; fragment 22 is the eight-rune p33 heading.

An additional **post-hoc checksum** is exact for this selected pair: fragment lengths sum to (1414+8=1422); the p50 bytes differ by (228-210=18); the first rune of fragment 22 has Gematria Primus prime value 79; and (18\cdot79=1422). Enumerating all 870 ordered pairs of nonempty fragments, only four have an integer quotient ((L_i+L_j)/(B_j-B_i)) that occurs among the 30 first-rune prime values, and only pair (19\rightarrow22) has that quotient equal to the later fragment's actual first-rune prime. This was noticed after selecting the M7 fixed points; the equation is not independently prescribed by a source clue, so treat it as a possible checksum rather than proof of intended design.\n\nThe resulting zero-based offset **1422** is a second post-hoc navigation hit: global offset 1422 (the 1,423rd rune) is p5 local 215, inside fragment **#6**, whose projective rank is **7**. The M7 denominator vanishes at 7, so (M_7(7)=\infty). The rune at that offset is **NG**, prime 79—the same rune and prime that begin fragment 22. This is suggestive but depends on zero-based indexing and was noticed after the checksum; it is not proof of an intended route.\n\nThe resulting rank-7 pole is the same (\infty) already associated in the current p32 synthesis with the signed-2016 phrase “path lies empty” ([current synthesis](../results/README.md)). The p50/fragment-length route reaches that pole by a separate chain of source values; it does not validate the word-map interpretation or supply a reversible operation.\n\nThis is a cross-artifact correspondence between the thirteen-dot segmentation, the p50 numeric table, and the p32 projectivity. It does **not** recover plaintext or specify how to transform ciphertext.

## Sensitivity and boundaries

- The source empty rows are #9 and #12 (zero-based table rows 8 and 11). As a sensitivity check, enumerate all \(\binom{32}{2}=496\) possible pairs of omitted table rows. **15** pairs leave the sorted values at ranks 22 and 25 equal to 210 and 228. The source pair is one of those 15. Therefore the byte pair alone is not a sharp statistical selector; the fragment identities depend on the natural chronological row alignment.
- The p33–p39 whole-page block contains 1,680 runes, exactly (30\times7\times8). However, the p33 second red heading begins at local offset 91; the heading-and-body region from that point is 1,589 runes. Do not describe all 1,680 as the post-heading cuneiform body. The factorization is a dimensional clue, not a cipher operation.
- The M7 structural derivation is documented in [tree-prime-canvas-partition](tree-prime-canvas-partition.md). This fragment-rank construction does not rely on the retired p32 26-word/page-local word walk; that word-address premise was independently rejected in [the corrected p32 boundary analysis](p32-m7-2016-word-fragment-alignment.md).
- Sorting by the unique column is a plausible operation, not an explicit instruction found on p50. Natural chronological row alignment is the least elaborate correspondence, but still needs an independently motivated use.

## M7 orbit partition and the 256-byte remainder

The same rank assignment partitions the 30 fragments into four 7-cycles and two fixed points. The cycle containing the pole rank 7, followed from that pole, is:

`rank 7 → 29 → 11 → 16 → 10 → 8 → 2 → 7`

It visits fragments `#6, #2, #23, #24, #18, #5, #29`, with lengths `690, 716, 1460, 3, 19, 3, 5`, totaling **2,896 runes**. Fragments #23/#24 are in the p33–p39 cuneiform region; fragment #29 is the five-rune p56 red heading. The other three cycles and two fixed points total **10,240 runes**, exactly (40\times256).

| M7 orbit | Ranks (M7 order) | Fragment IDs | Fragment lengths | Total |
|---|---|---|---|---:|
| C1 | 0, 4, 14, 18, 26, 9, 21 | 7, 14, 13, 27, 1, 8, 3 | 11, 11, 9, 9, 13, 308, 16 | 377 |
| C2 | 1, 27, 12, 15, 28, 23, 5 | 20, 30, 31, 25, 16, 21, 26 | 10, 80, 7, 118, 16, 81, 3008 | 3320 |
| C3 (pole) | 2, 7, 29, 11, 16, 10, 8 | 29, 6, 2, 23, 24, 18, 5 | 5, 690, 716, 1460, 3, 19, 3 | 2896 |
| C4 | 3, 6, 20, 17, 13, 24, 19 | 11, 10, 4, 32, 15, 28, 17 | 1729, 14, 103, 88, 1883, 299, 1005 | 5121 |
| Fixed | 22 | 19 | 1414 | 1414 |
| Fixed | 25 | 22 | 8 | 8 |

The C3 total happens to equal the manuscript's documented **2,896-word** count, but these are not the same units and C3 includes five solved p56 runes. Treat this as a notable partition, not an identity. C1 also totals (377=13\times29). The full fragment corpus is 13,136 runes; removing C3 leaves (10,240=40\times256), matching 40 repeats of the 256-byte p50 table. These exact dimensions motivated a bounded test, not an assumption that the table is a key.

Under a conditional random-labeling null, the pole cycle occupies a fixed 7-subset of the 30 fragment lengths. Exactly **310** of the **2,035,800** possible 7-subsets sum to 2,896, giving a conditional probability of **1.52×10⁻⁴**. This is not a selection-corrected p-value: the match was noticed post hoc, the word/rune units differ, and the table-to-fragment assignment may not be random. It is a reason to retain the orbit partition as a hypothesis, not proof of intent.

### Direct 256-byte additive-pad test — negative

The 256-byte p50 table contains only **161 distinct byte values**, so it is not a byte permutation/S-box. The 10,240-rune remainder was assembled in two source-motivated orders: ascending projective rank, and the other M7 cycles in their canonical orbit order (with fixed points last). The full p50 256-byte table was used as a period-256 key, with byte-to-GP29 conversion (b\bmod29). Both original table row order and rows sorted by the unique second column were tested, with both additive signs. This is eight finite variants; all remain ciphertext-like and score worse than their corresponding raw target under the same Gibran trigram control.

| Target order | Key row order | Sign | IoC | Mean trigram log-score |
|---|---|---:|---:|---:|
| Rank | Original | − | 0.034473 | −12.30854 |
| Rank | Original | + | 0.034459 | −12.27473 |
| Rank | Sorted | − | 0.034503 | −12.29129 |
| Rank | Sorted | + | 0.034525 | −12.28138 |
| Orbit | Original | − | 0.034536 | −12.31135 |
| Orbit | Original | + | 0.034434 | −12.31411 |
| Orbit | Sorted | − | 0.034540 | −12.32152 |
| Orbit | Sorted | + | 0.034449 | −12.28706 |

Raw rank-order and orbit-order trigram scores are −12.22752 and −12.22637 respectively. The best decoded rank-order score (−12.27473) and best decoded orbit-order score (−12.28706) are both worse. The simplest period-256 additive interpretation is therefore rejected; do not repeat it with arbitrary offsets or equivalent byte projections.

The orbit partition and this finite test are reproducible with [`sims/p50_m7_orbit_partition_sft.cjs`](../sims/p50_m7_orbit_partition_sft.cjs).

## Reproduction

Run the following from the repository root with Node.js. It asserts the counts and emits the fixed-point mapping and omitted-row sensitivity result.

```js
const fs = require("node:fs");
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const grid = read("resources/liber-primus/lp2-grid-256.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");

const pages = [];
let offset = 0;
for (const p of corpus.pages) {
  pages.push({ page: p.page, start: offset, end: offset + p.indices.length, indices: p.indices });
  offset += p.indices.length;
}
const marks = [];
for (const p of ink.pages) {
  const base = pages.find(x => x.page === p.page).start;
  for (const e of (p.large_punctuation || [])) if (e[1] === 13) marks.push(base + e[0]);
}
marks.sort((a, b) => a - b);
const bounds = [0, ...marks, offset];
const all = pages.flatMap(p => p.indices);
const fragments = bounds.slice(0, -1).map((start, i) => ({
  id: i + 1, start, end: bounds[i + 1], length: bounds[i + 1] - start,
  firstRunePrime: corpus.prime[all[start]]
}));
const empty = fragments.filter(f => f.length === 0).map(f => f.id);
const ranked = fragments.filter(f => f.length > 0).map(f => ({
  ...f, byte: grid.bytes[(f.id - 1) * 8 + 1]
})).sort((a, b) => a.byte - b.byte);

const mod = n => ((n % 29) + 29) % 29;
const inv = n => {
  for (let i = 1; i < 29; i++) if (mod(n * i) === 1) return i;
  throw new Error("no inverse");
};
const m7 = x => {
  if (x === 29) return mod(14 * inv(25)); // infinity
  const d = mod(25 * x + 28);
  return d === 0 ? 29 : mod((14 * x + 25) * inv(d));
};
const fixed = Array.from({ length: 30 }, (_, x) => x).filter(x => m7(x) === x);
const selected = fixed.map(rank => {
  const f = ranked[rank];
  return {
    rank, fragment: f.id, length: f.length, byte: f.byte,
    quotient: Math.floor(f.byte / 29), remainder: mod(f.byte)
  };
});
const fragment19 = fragments.find(f => f.id === 19);
const fragment22 = fragments.find(f => f.id === 22);
const checksum = (selected[1].byte - selected[0].byte) * fragment22.firstRunePrime;
const fixedLengthSum = fragment19.length + fragment22.length;
const pointerOffset = checksum;
const pointerFragment = fragments.find(f => pointerOffset >= f.start && pointerOffset < f.end);
const pointerRank = ranked.findIndex(f => f.id === pointerFragment.id);
const pointerPage = pages.find(p => pointerOffset >= p.start && pointerOffset < p.end);
const pointerRuneIndex = all[pointerOffset];
const pointer = {
  offset: pointerOffset, position1: pointerOffset + 1,
  page: pointerPage.page, local: pointerOffset - pointerPage.start,
  fragment: pointerFragment.id, rank: pointerRank,
  rune: corpus.translit[pointerRuneIndex], prime: corpus.prime[pointerRuneIndex],
  m7: m7(pointerRank)
};
const distinctByColumn = Array.from({ length: 8 }, (_, c) =>
  new Set(Array.from({ length: 32 }, (_, r) => grid.bytes[r * 8 + c])).size
);

const firstPrimeSet = new Set(ranked.map(f => f.firstRunePrime));
const arithmeticCandidates = [];
for (const a of ranked) for (const b of ranked) if (a.id !== b.id) {
  const d = b.byte - a.byte, n = a.length + b.length;
  if (d !== 0 && n % d === 0 && firstPrimeSet.has(n / d)) {
    arithmeticCandidates.push({ a: a.id, b: b.id, quotient: n / d,
      laterFirstPrime: b.firstRunePrime, exact: n / d === b.firstRunePrime });
  }
}
const arithmeticMatches = arithmeticCandidates.filter(x => x.exact);

let omittedPairs = 0;
for (let a = 0; a < 32; a++) for (let b = a + 1; b < 32; b++) {
  const values = Array.from({ length: 32 }, (_, r) => grid.bytes[r * 8 + 1])
    .filter((_, r) => r !== a && r !== b).sort((x, y) => x - y);
  if (values[22] === 210 && values[25] === 228) omittedPairs++;
}
const p33 = pages.find(p => p.page === 33).indices;
const p33to39 = pages.filter(p => p.page >= 33 && p.page <= 39)
  .reduce((n, p) => n + p.indices.length, 0);
const fromHeading = p33.slice(91).length +
  pages.filter(p => p.page >= 34 && p.page <= 39)
    .reduce((n, p) => n + p.indices.length, 0);

if (marks.length !== 31 || fragments.length !== 32 ||
    JSON.stringify(empty) !== JSON.stringify([9, 12]) ||
    ranked.length !== 30 ||
    JSON.stringify(distinctByColumn) !== JSON.stringify([30, 32, 30, 30, 30, 31, 31, 30]) ||
    JSON.stringify(fixed) !== JSON.stringify([22, 25]) ||
    selected[0].fragment !== 19 || selected[0].byte !== 210 ||
    selected[1].fragment !== 22 || selected[1].byte !== 228 ||
    fixedLengthSum !== 1422 || checksum !== 1422 || pointer.fragment !== 6 ||
    pointer.rank !== 7 || pointer.rune !== "NG" || pointer.prime !== 79 || pointer.m7 !== 29 ||
    p33to39 !== 1680 || fromHeading !== 1589 || omittedPairs !== 15) {
  throw new Error("source correspondence changed; inspect inputs");
}
console.log(JSON.stringify({
  marks: marks.length, fragments: fragments.length, empty,
  distinctByColumn, fixed, selected, omittedPairs,
  p33to39, fromHeading, arithmeticCandidateCount: arithmeticCandidates.length,
  arithmeticMatches, checksum, fixedLengthSum, pointer
}, null, 2));
```

**Next useful decision:** determine whether the pole-cycle partition has an independently source-selected reading operation. The direct 256-byte additive pad is rejected. Do not promote the count matches to a cipher or continue unconstrained table transformations without a new clue that selects a reversible operation.
