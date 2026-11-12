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

## Decision

Retain this as a candidate structural clue only. The unresolved premises are whether the first210 bytes are the intended slice and what original source fixes the fold/readout. The 2016 FOLD/3D map and prime_echo page-word path are provisional selectors, not authenticated instructions. Reopen only if an independent primary source fixes the 210-byte frame and a reversible operation; otherwise park.

Run `node sims/p50_210_fold_symmetry_gate.cjs` from the repository root to reproduce the p50 cell location, mirror pairs, all-sum scan and four conditional nulls.
