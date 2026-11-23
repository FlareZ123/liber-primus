# Original LP2 ciphertext versus 19 full-length OutGuess binary streams as direct pads

**Evidence class:** exhaustive finite-candidate test for one precisely specified reversible source-key family, using original LP2 pages and genuine OutGuess extracts. Updated 23 November 2026. **No previously unknown LP2 plaintext or key was recovered.**

## Hypothesis and source distinction

The original-image default-key scan recovered **16 unvalidated 58,152-byte binary arrays from LP2 JPEGs** (pages 17, 21, 43, 57–65, 68–71). Authentic LP1 pages 00, 08 and other signed historical payloads are separate controls/material, not members of this binary-array family.

A later scan of all LP1 originals recovered three additional **58,152-byte binary payloads** from LP1 pages 06, 07 and 09. These are the only three LP1 payloads with the same full-length binary shape. They are not authenticated messages; they are tested here only as a source-motivated possibility that a solved LP1 page might supply an LP2 key. Their exact payload SHA-256 values are:

| LP1 page | Bytes | SHA-256 |
| --- | ---: | --- |
| 06 | 58,152 | `7551f316388ef7f413b72d6ea30c422ee174406d226c24375a72377adbe42064` |
| 07 | 58,152 | `c1af55ba9d982c7c8a463ac81c68bf9b8a7b814b54e395d9b6920a340fdfcfd5` |
| 09 | 58,152 | `a35f439175a16486e6b5699cc45a265fa9d82eea15b92a52a124d549d97ff4f1` |

The 2014 LP1 pages 00–02 are a different object: each contains a PGP-clear-signed **991-byte hex share**. Their historically specified role is a three-way XOR reconstruction of a signed message, not use as independent direct pads. See [the source-authenticated Stage03 reconstruction](lp2-2014-onion3-triple-xor-original-table-gate.md). Pages 03 and 10–13 likewise contain signed historical text/image payloads and are not 58K byte arrays.

## Exact original-ciphertext test

For each of the **19** full-length arrays, enumerate every byte-aligned start that supports an entire target page under the no-skip reversible family

`plaintext[i] = (ciphertext[i] + or - K[offset+i]) mod 29.`

For `K`, test both byte reductions (`byte mod 29` and `floor(29*byte/256)`), both byte orders (forward/reverse), and both signs. The input is all **55 canonical unsolved rune-bearing LP2 page records**, **12,956 original runes**, with punctuation stripped only for this exact model. Page 50 is numeric and rune-free. This gives **152 source/reducer/orientation/sign models per page** and **484,189,768 complete-page byte-offset configurations** across the 55 pages. Each complete page is scored using Laplace-smoothed GP monogram log probabilities trained on the first 75% of a pinned Shakespeare control text. No proposed English plaintext is injected into the original ciphertext.

The successful **19-stream extension** is [workflow run 45151022597](https://github.com/FlareZ123/liber-primus/actions/runs/45151022597); its [artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45151022597/artifacts/14807030507) contains the 19 raw streams, exact SHA-256 values, per-page winners, all null maxima, and the planted control. The earlier 16-LP2-stream baseline was [run 42778841092](https://github.com/FlareZ123/liber-primus/actions/runs/42778841092); the 19-stream family supersedes that baseline for the combined source set.

### Original-page results

- For LP2 page 0 (**262 runes**), the best of all 152 models and legal offsets is log-fit **−3.6357936202 per rune** (21.payload, scaled reduction, reverse, minus, source offset 28,485). Across **64 full-family rescan controls** preserving this page's exact cipher-rune multiset and shuffling only its order, **29/64** produce an equally or more favorable selected-family maximum. Add-one empirical upper-tail **30/65 = 0.46153846**. Null mean maximum **−3.631520880**, null best **−3.558967105**. The observed score has no support above this selection-matched baseline.
- The highest raw score across all pages remains on very short record 49 (**66 runes**, −3.24969665), followed by records 54 (**76 runes**, −3.28114868) and 50 (**92 runes**, −3.35839933). These short records have more opportunities for overfit. The best original long-page score among pages with at least 180 runes is record 33 (**214 runes**, −3.52039531). The median winner over all 55 pages is **−3.61940015**. No independently authenticated original-language passage emerged.
- The three added LP1 streams do not produce a standout page/key pairing. Their occasional appearance among pagewise top candidates is at ordinary background scores; the global page-0 winner is still an LP2 stream.
- The 19-stream search does not alter the decision: the tested direct-additive family is unsupported.

## Original-byte held-out English positive control

A **262-GP-rune control passage** from the final 25% of the same independently pinned Shakespeare source was encrypted using the actual original OutGuess 17.payload key bytes, reduction mod 29, forward orientation, additive sign plus, and undisclosed-to-scanner offset **12,345**. The scorer's probability reference was trained only on the first 75% of the source.

The exhaustive 152-mode/full-offset search recovers **17.payload, mod29, forward, inverse sign minus, offset 12,345 as rank 1**. Its score is **−3.0308525681**, versus **−3.6669422402** for the strongest incorrect setting. This validates that the declared search detects a genuine candidate key when the exact source family generates GP-English.

## Decision and scope

The 19 original-image binary streams **do not function as simple directly aligned additive mod-29 pads** for detectable Shakespeare-register GP-English under the enumerated byte reductions, orientations, shifts and independent per-page starts. The 64 selection-matched page-0 reshuffles show that its best score is routine under the full search. This conclusion is conditional on the source register, no additional substitution/transposition, no wordwise clock reset, no rejected pad draws, and the tested byte-to-rune reducers. It does not establish that OutGuess arrays are meaningless or that every more complex source-derived key schedule is impossible.

**Research implication:** the 16 LP2 streams and three same-shaped LP1 streams cannot be promoted to an LP2 key merely by scanning byte offsets or citing a favorable short-window score. The 2014 991-byte LP1 shares must be treated according to their historically specified XOR role, not reclassified as arbitrary keys. Any further OutGuess-key claim must name a distinct source-motivated transform, recover original plaintext, and demonstrate independent exact re-encryption. Repeating the direct-pad scan is low priority.

## Reproduce

- [Complete original-stream pad inversion, control and selection-aware null](../sims/outguess_lp2_directpad.py), Python 3.11, NumPy and Numba. Set `OUTGUESS_INCLUDE_LP1=1` to include pages 06, 07 and 09.
- [Original-JPEG OutGuess workflow](../.github/workflows/lp2-outguess.yml), including the LP1-history scan and artifact preservation. The 19-stream result is run [45151022597](https://github.com/FlareZ123/liber-primus/actions/runs/45151022597).
- The earlier 16-LP2-stream baseline, its positive control and its original null are preserved in [run 42778841092](https://github.com/FlareZ123/liber-primus/actions/runs/42778841092).
- The 19-stream page-0 null used fixed NumPy RNG seed `0x40d17c91`; each shuffled manuscript was independently reoptimized over all 152 modes and all legal byte starts. No uncorrected maximum or short-prefix score is treated as a discovery.
