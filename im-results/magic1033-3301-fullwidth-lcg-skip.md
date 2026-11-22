# Two LP magic-square totals as a full-width 32-bit keystream: direct skip-aware inversion

**Agent 4, 2026-11-10. Classification:** source-constrained, positive-control-backed **finite key-family negative**. No LP2 plaintext or authentic key was recovered.

## Why this specific candidate is worth inverting

LP1 scan \`05.jpg\` contains a 5×5 number square with each row/column summing to **1033**, including a reversible embedded hex/reversed-byte payload; see [the original JPEG analysis](jpeg05-palindromic-magic-square.md). Another published Cicada magic square has sum **3301**. Both numbers are odd and congruent to 1 modulo 4. A 32-bit linear congruential generator

\[
x_{j+1}=a x_j+c\pmod{2^{32}}
\]

therefore has a full period of \(2^{32}\) if \(a\in\{1033,3301\}\) and \(c\) is the other total (Hull–Dobell conditions). This is a **testable hypothetical use of manuscript clue numbers**, with no independent evidence that Cicada used an LCG. It differs from the previously tested LCG *modulo 29* in [affine-lcg-keystream.md](affine-lcg-keystream.md) and the lag-six recurrence *modulo 29* in [affine-3301-keystream-heldout.md](affine-3301-keystream-heldout.md).

The model emits one of six 29-symbol key values from each 32-bit state: state modulo 29, four byte shifts (0, 8, 16, 24 bits) reduced modulo 29, or \(\lfloor29x/2^{32}\rfloor\). Both additive signs are tested. Each generator is run forwards or backwards, where the backwards mode uses the exact inverse of the odd multiplier modulo \(2^{32}\).

The 295 candidate 32-bit seeds include **all 256 one-byte seeds**, original magic-square cell values, the two totals, year/3301 identifiers, and the first four bytes (both directions) of each of the eight vertical columns in the LP2 256-byte numeric table. There is no floating crib or arbitrary lexical phrase fitting.

## Cipher-repair-aware direct inversion

The ciphertext symbols \(C_i\) are decrypted as \(P_i=(C_i+sK_{j_i})\bmod29\), with sign \(s\in\{-1,+1\}\). A hidden retry can consume an additional key state **only if that key state, combined with the current candidate plaintext symbol, would have produced the previous *published* ciphertext glyph**. Each plaintext symbol permits 0, 1, or 2 rejected key draws; no more than 25 extra draws are permitted over a page. Each rejected draw incurs a log-penalty of 3.5.

The exact finite-state Viterbi pass jointly recovers the most likely GP-English trigram plaintext and retry-pointer path for a **fixed** candidate seed, recurrence direction, output reduction and sign. The trigram model is trained on the first 180,000 characters of the repository's held-out Shakespeare reference; it does not see candidate LP2 plaintext. There are \(26\times3=78\) states per observed rune, and a candidate is scored over an entire physical page.

Thus there are \(2\) magic-square coefficient orientations \(\times2\) stream directions \(\times295\) seeds \(\times6\) key-output reductions \(\times2\) signs = **14,160 candidate models per page**.

## Original LP2 findings

We tested two separate original, rune-bearing pages: **physical page 0 (262 symbols)** and **physical page 52 (263 symbols)**, the latter lying after the 256-byte grid. The original corpus is [resources/liber-primus/lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), with physical pages 0–55 excluding the runeless page 50.

| Measure | LP2 page 0 | LP2 page 52 |
|---|---:|---:|
| Models searched | 14,160 | 14,160 |
| Best fitted log likelihood / rune | **−5.295140** | **−5.296477** |
| Median fitted log likelihood / rune | −5.835827 | −5.838425 |
| Best multiplier / increment | **1033 / 3301** | **3301 / 1033** |
| Best stream direction | forward | inverse |
| Best seed | 120 | 240 |
| Best key-reduction mode | 32-bit state mod29 | 32-bit state mod29 |
| Best plaintext sign | +1 | −1 |
| Best inferred extra consumed key draws | 6 | 6 |

The two highest-ranked candidate plaintext previews remain GP-rune gibberish, and the selected keys and direction disagree between the two pages. The scores are selection-optimized across all 14,160 settings, so a modest relative improvement would never establish a key recovery.

## Independent planted recovery control

The exact program also generates 262 known GP-English runes from the *nontraining* final portion of the Shakespeare reference, encrypts with known source-derived full-width LCG state and adds an **81%-probability, at-most-two-retries collision-triggered key-advance rule**. The solver is given the candidate key schedule but **not** the retry positions.

| Plant | Actual rejected key draws | Viterbi-inferred rejected draws | Original runes recovered | Score / rune |
|---|---:|---:|---:|---:|
| \(a=3301,c=1033\), forward, low-byte reduction, seed 73 | 8 | **8** | **262/262** | −2.460390 |
| \(a=1033,c=3301\), inverse, highest-byte reduction, seed 91 | 6 | **6** | **262/262** | −2.433673 |

These are complete, independently held-out textual recoveries under the exact hypothesized key/skip model; therefore failure on the actual pages cannot simply be attributed to the Viterbi program's inability to invert a correct seed when it consumes hidden keys.

## Interpretation, exact reproducibility and limits

**No original LP2 plaintext was recovered.** The original pages' best scores are more than **2.8 log likelihood units per rune worse** than the two planted controls, and no candidate yields readable GP English. This is strong negative evidence for the declared full-width LCG seed/pad family, not a broad theorem about every pseudorandom key derivation from the squares. Other encodings, nonlinear key generation, a cipher alphabet outside the standard GP symbols, arbitrary offset, state other than a chosen seed, ciphertext overwrites, or a different source register remain open.

The code also makes a scope limitation explicit: each page starts a fresh LCG from one of the 295 candidate seed values at draw offset zero, with a bounded collision-triggered skipping path. This particular direct-key model is disfavoured, while wider offset and cross-page key derivations are not tested.

**Reproduction:** [sims/magic1033_3301_lcg_skip.cjs](../sims/magic1033_3301_lcg_skip.cjs), a single dependency-free CommonJS program with assertions; [manual-only GitHub workflow](../.github/workflows/magic1033-3301-lcg-skip.yml); [successful complete execution 42764307472](https://github.com/FlareZ123/liber-primus/actions/runs/42764307472). Each candidate and both planted controls were executed as committed. The program writes no files.

**Next action:** obtain independently specified key-state initialization or a mechanistic rule explaining the cross-word doublet suppression and word-local six-apart echo, and evaluate it by exact recovery and re-encryption. Exhaustively widening unconstrained LCG seed guesses without additional evidence is unlikely to advance the manuscript.
