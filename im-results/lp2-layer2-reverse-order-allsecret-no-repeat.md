# The reverse two-layer order: original GP29 no-repeat obstruction (17 November 2026)

## Decision

**No new Liber Primus plaintext, key or destination has been recovered.** An independently distinguishable two-stage historical candidate is now excluded on original runes under a strict, explicit cipher architecture: **first a GP29 outer-key stage that rejects repeated adjacent output runes, then a conventional chapter-continuous GP29 Vigenère stage**. The earlier historic large screen tested the opposite, anti-repeat-last order. The reverse order has a stronger key-independent contradiction.

For the historically ordinary last-stage Vigenère, **every possible 29-symbol secret keyword of each period 1–28 is impossible** on the complete original **3,008-rune chapter p40–p53**, even if the earlier anti-repeat layer is allowed to reset at every actual printed word. This exclusion requires no guess about the first-layer number sequence, the plaintext language, the final keyword, or its initial phase. Its proof is a 29-residue saturation witness at each period.

For a last-stage cipher with the authentic Cicada plaintext-Fehu bypass, there is no equally simple all-secret phase proof. A separate *exact* finite-state test excludes all **30 historically catalogued explicit keywords**, both signs, all starting phases, both Fehu modes and both strict-anti-repeat reset conventions on each of the **nine original intact chapters**. None of the **2,160 original chapter/word-boundary tests** survives its complete chapter. This result is bounded to the 30 explicit keywords when bypass is enabled.

## First-party source geometry

- The canonical GP29 [original corpus](../resources/liber-primus/lp2-corpus.json) contains 12,956 unknown LP2 runes p0–p55. The [rune-level page transcription](../resources/lp2-transcription.txt) reproduces all **13,136** rune indices including solved p56 and clear p57, without any index disagreement.
- In the transcription, actual `-` and `.` word separators yield exactly **2,896** unknown-page word starts; `/`, physical-page seams, annotation marks and the rune-free p50 numeric page do **not** insert fabricated word boundaries. Thus the experiment grants a no-repeat clock restart at every **actual** word, including page-spanning words.
- The original visible nine chapter lengths are **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008 and 308**. The decisive long chapter p40–p53 begins at global unknown-rune offset **9,640** and ends at offset **12,648**. Its 3,008 indices and word-start mask are extracted directly from those canonical files.

## All-secret necessary-condition proof

Let `q[i]` be the output of a **strict repeated-rune-rejecting** first layer, and let the last layer be conventional additive Vigenère `c[i] = q[i] + K[(i+s) mod m] mod 29`, consuming one key element for every rune. Within any genuine printed word, the first layer implies `q[i] != q[i-1]`. For a fixed phase class `j = (i+s) mod m`, the opposite equality would hold if and only if

```text
(c[i] - c[i-1]) mod 29 = (K[j] - K[j-1]) mod 29.
```

The right-hand side is **one fixed residue** for all original within-word adjacent pairs in that phase class. For each candidate period `m=1..28`, there exists an original phase `j` at which the left-hand side takes **all 29 GP29 values**. Consequently *every possible secret key difference* causes at least one forbidden adjacent repeat in `q`. The contradiction holds even for a key with unrestricted 29-symbol values and a different key for every chapter.

| Candidate key period | A fully saturated phase, 0-indexed |
|---|---:|
| 1–12 | 0 for all |
| 13, 14, 15, 16 | 1, 0, 1, 2 |
| 17, 18, 19, 20 | 1, 5, 0, 5 |
| 21, 22, 23, 24 | 4, 5, 2, 4 |
| 25, 26, 27, 28 | 4, 6, 3, 1 |

The [reproducer](../sims/lp2_layer2_reverse_order_allsecret_sft.cjs) reconstructs a **29-position original ciphertext witness for every one of the 28 periods**. Each witness records one genuine within-word adjacent position for each possible delta 0..28 in its saturated phase, independently checking the phase, symbol values and word boundary. A fixed one-to-one Atbash-style relabelling of `q` before the final Vigenère also preserves this equality obstruction.

The first nonexcluded key period in the tested 1–35 exploratory range is **29**, reflecting the sample capacity of this necessary constraint. This observation supplies **no evidence for a 29-rune key**: survival of one necessary condition is not a demonstration of decryption.

## Exact fixed-key Fehu-bypass branch

The historical 30-word catalog is exactly the source-fixed `WORDS` list in [the existing terminal test](../sims/lp2_layer2_terminal_zerooffset_sft.cjs), including `DIVINITY`, `FIRFUMFERENFE`, `CIRCUMFERENCE`, `WELCOME`, `KOAN` and `THEPRIMESARESACRED`. Its GP transliteration and historical aliases are unchanged.

The reverse-stage decoder initializes **every** possible keyword phase and consumes the full original original ciphertext rune by rune without beam pruning. For each rune, it allows the ordinary key-consuming branch; with the authenticated Fehu bypass enabled, the rune `q=F` instead emits `c=F` and does **not** consume the key. The candidate state retains the exact keyword phase and previous intermediate rune. A state is discarded immediately if its intermediate rune repeats the preceding one within a genuine printed word; the chapter-only version also checks across all word boundaries.

The complete test matrix consists of **30 keywords × 2 signs × 2 Fehu modes × 9 chapters × 2 strict-clock conventions = 2,160 original-input tests**. Each chapter starts with every possible final-key phase. **Zero** of these tests admits a full-chapter intermediate stream. The maximum original feasible prefixes across the 30 words/signs/Fehu modes, allowing a first-stage restart at every printed word, are:

| Original chapter | Runes | Largest surviving prefix |
|---|---:|---:|
| p0–p2 | 729 | 285 |
| p3–p7 | 1,145 | 200 |
| p8–p14 | 1,729 | 274 |
| p15–p22 | 1,903 | 234 |
| p23–p26 | 1,021 | 225 |
| p27–p32 | 1,433 | 272 |
| p33–p39 | 1,680 | 349 |
| p40–p53 | 3,008 | 231 |
| p54–p55 | 308 | 267 |

Some arbitrary configurations admit 150–349-rune prefixes, but none decodes a complete original chapter and none recovers authenticated prose. No n-gram optimization, unknown key offset, learned keyword, dictionary, or scoring threshold was used for this exclusion.

## Independent positive and limits

The reproducer synthesizes a strict no-doublet first-layer stream from original **clear p57 GP runes**, repeating that 95-rune source to original-shaped lengths. A final Fehu-transparent Vigenère using the genuine 13-rune `CIRCUMFERENCE` spelling is planted at lengths **729, 308 and 3,008**, different signed keys and nonzero initial phases; **all three** pass exact reverse decoding with and without wordwise anti-repeat resets. A separate **3,008-rune, unrestricted 28-symbol hidden-key** no-Fehu plant retains at least one allowable key delta per phase, so the supposed all-secret contradiction correctly **does not** fire. The full original-input and positive assertions passed in an isolated V8 reproduction of the committed source with exact original inputs; native Node 22 Windows CI was dispatched separately and should not be presented as complete until its run succeeds.

**Remaining live possibilities:** the historically favored anti-repeat-**last** order, a first-layer mechanism that *allows* adjacent output doubles (the distinct coin model), an independently sourced Fehu-bypass last-stage keyword outside the frozen 30, final-key resets or advances inside a chapter, inserted/deleted runes, nonadditive or dynamically varying final substitutions, and other manuscript mechanisms. This is a targeted negative that removes a whole branch of speculative historical two-layer work. It does not close [Director issue #1339](https://github.com/FlareZ123/liber-primus/issues/1339), whose genuine original anti-repeat-last positive/negative campaign remains open.
