# p49–p51 210-fold symmetry candidate

**Classification:** intermediate structural observation; no plaintext, key, or complete cipher recovered.

The canonical pp49–51 numeric object is 256 bytes in a 32×8 grid (80+104+72 bytes). The p32 red-triad/M7 construction has a derived 210-state period. The provisional 2016 base-58 word map selects p14 word1 **FOLD** and p50 cell3 **3D** (base-60 token `3D`, byte value193). A still-inferred 2013 prime_echo page/word path offers a cross-round check: p38 fourth word `SRUTH` has GP-prime sum72→p14 word1 FOLD; p40 fourth word `EOEAOE` has sum224→p50 cell3 3D. However the same sums occur in other first-line columns (72 at p39 col0; 224 at p34 col6), so the row→page/column→word grammar is not validated. The 2014 Stage5 “Do four unreasonable things each day” wording is only a weak possible fourth-word selector.

## Exact mirror observation

p49 occupies 80 bytes. The p50 fourth token (zero-based cell3) is `3D`, hence byte193 at global offset83. In the 256-byte stream, byte193 occurs at offsets **83 and 127**, byte201 at **82 and 128**, and byte33 at **19, 153 and 191**.

The first 210 bytes have a fixed reflection relation (i+j=210). Across the 104 disjoint mirrored pairs (i=1…104, j=210−i), exactly three are equal:

| Pair | Equal byte | Note |
|---|---:|---|
| (19,191) | 33 | isolated mirror match |
| (82,128) | 201 | first half of adjacent pair |
| (83,127) | 193 | p50 cell-3 value |

The last two pairs form an exact two-byte reversal: offsets 82–83 are `C9 C1`, while offsets 127–128 are `C1 C9`. They are adjacent around the 210-sum axis (midpoint105).

## Conditional nulls

The byte multiset has 161 distinct values and 69 duplicated values. Its expected equal matches among 104 pairs are **0.40466**, versus 3 observed. Deterministic simulations with fixed seeds give:

| Null preserving | Trials | P(≥3 equal pairs) | P(adjacent run ≥2) |
|---|---:|---:|---:|
| Full byte multiset | 100,000 | 0.00800 | 0.00168 |
| Shuffle within each 8-byte row | 50,000 | 0.00948 | 0.00032 |
| Shuffle within each column | 50,000 | 0.00926 | 0.00158 |
| Shuffle 8-byte rows as blocks | 50,000 | 0.00858 | 0.00150 |

The adjacent two-pair run is unique at sum210 when all reflection sums are scanned; another sum (295) has four isolated matches. The fixed-210 test is motivated by the p32 period, but the byte pattern was noticed after inspecting the table. These are conditional exploratory frequencies, not discovery-wide p-values.

## Direct readout gates

The historical 2014 period-seven inverse/forward on the first210 bytes, pairwise mirrored XOR/addition/subtraction, simple 4×8×8 folds of the native 32×8 layout, exploratory 3×7×10 three-layer XOR/add folds, and mirrored-pair interleaving followed by period7 did not yield readable plaintext. These are bounded negatives for those direct readouts, not proof that every fold is false.

## Source-selector audit (Director Issue #500; 12 November 2026)

The candidate's apparent source anchors are weaker than their labels suggest:

- **p14 “FOLD” is not a source-visible original heading.** It is a word recovered only under the provisional 2016 base-58 word map. That map is not an authenticated LP2 decoder. The p50 cell-3 token “3D” is produced by the same provisional map; its numeric value is also radix-dependent (base60 193 versus base59 190). Neither token independently selects a byte frame or fold.
- The proposed 2013 `prime_echo` page/word cross-check is still inferred. The same GP-prime sums occur at p39 column 0 and p34 column 6, so the row→page/column→word grammar is not unique. The 2014 Stage5 “Do four unreasonable things each day” wording is only a weak possible fourth-word selector, not a 210-byte instruction.
- The signed 2016 message says that numbers are direction, but it gives no fold, 210-byte length, byte-frame origin, axis, pairing order, direction, or leftover-cell rule.
- The finite historical operator audit across archived 2012–2014 Cicada stages found explicit book-code coordinates, complete byte-stream reversal, and Atbash-ROT3, but no 210-byte slice, mirrored-pair fold, recursive arithmetic fold, or corresponding readout ([earlier-operation audit](earlier-cicada-p55-fold-operator-audit.md)). The signed 2016 FOLD/T6 mirror study likewise treats the fold as a hypothesis rather than an authenticated operation ([source-constrained report](lp2-2016-fold-t6-mirror-keyless-gate.md)).
- The canonical p49–p51 object is a physical 256-byte, 32×8 table. Nothing selects its first 210 bytes or explains the remaining 46. The 210-sum mirror axis is derived from a conditional p32 M7 period, and the byte matches were noticed after inspecting the table. The null calculations are conditional structural evidence, not a source selector.

No original or period-authenticated source therefore fixes the complete chain: choose the first 210 bytes; anchor the frame at offset zero; pair positions around i+j=210; choose the fold axis and direction; order the pairs; handle the remaining 46 cells; and define a reversible readout/encoder. The observed two-byte reversal and three equal mirrored pairs remain interesting intermediate structure, but cannot choose their own frame or operation.

## Decision

**Bounded no-selector result:** retain the mirror pattern as an intermediate observation only. The proposed 210-byte fold is not an established decipherment mechanism and has no source-selected inverse. Do not search shifted frames, alternative axes, pairing orders, or plaintext-scored readouts. Reopen only if an independent original clue selects the 210-byte frame and the complete reversible fold/readout; otherwise retire this 210-fold route.

Run `node sims/p50_210_fold_symmetry_gate.cjs` from the repository root to reproduce the p50 cell location, mirror pairs, all-sum scan and four conditional nulls.
