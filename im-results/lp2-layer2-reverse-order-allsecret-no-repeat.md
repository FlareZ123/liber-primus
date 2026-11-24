# The reverse two-layer order: original GP29 no-repeat obstruction (17 November 2026)

## Decision

**No new Liber Primus plaintext, key or destination has been recovered.** An independently distinguishable two-stage historical candidate is now excluded on original runes under a strict, explicit cipher architecture: **first a GP29 outer-key stage that rejects repeated adjacent output runes, then a conventional chapter-continuous GP29 Vigenère stage**. The earlier historic large screen tested the opposite, anti-repeat-last order. The reverse order has a stronger key-independent contradiction.

For the historically ordinary last-stage Vigenère, **every possible 29-symbol secret keyword of each period 1–28 is impossible** on the complete original **3,008-rune chapter p40–p53**, even if the earlier anti-repeat layer is allowed to reset at every actual printed word. This exclusion requires no guess about the first-layer number sequence, the plaintext language, the final keyword, or its initial phase. Its proof is a 29-residue saturation witness at each period.

For a last-stage cipher with the authentic Cicada plaintext-Fehu bypass, there is no equally simple all-secret phase proof. A separate *exact* finite-state test excludes all **30 historically catalogued explicit keywords**, both signs, all starting phases, both Fehu modes and both strict-anti-repeat reset conventions on each of the **nine original intact chapters**. None of the **2,160 original chapter/word-boundary tests** survives its complete chapter. **With literal-Fehu bypass and a completely unrestricted secret periodic key, exact original-source search now excludes every GP29 key of period 1–6, a combined 616,067,010 possible key arrays.** Periods 1–4 are enumerated directly; periods 5 and 6 are covered by mathematically necessary masks from a source-native 118-rune Fehu-free span and exact full-chapter inversion of every mask-surviving key. The first layer can restart at every genuine printed word. A subsequent exact partial-key automaton excludes periods 7 and 8 as well (see below); a compressed-phase SAT formulation also excludes unrestricted period 13. Other periods ≥9 remain open. The 30-word finite test independently covers the original nine chapters.

## First-party source geometry

**Corrected audit, 17 November 2026:** The initial SFT incorrectly cut the middle chapters at p26/27 and p32/33 rather than the source-mapped p27/28 and p31/32 boundaries. The corrected original-source 2,160-test replay still has zero complete-chapter survivors, and the p40–53 all-secret periods 1–28 witness is unchanged. The three affected chapter lengths and per-chapter maximum feasible prefixes below are the corrected values; the previous p27–32 and p33–39 maxima should not be reused. This is a source-geometry correction, not evidence of new plaintext.

- The canonical GP29 [original corpus](../resources/liber-primus/lp2-corpus.json) contains 12,956 unknown LP2 runes p0–p55. The [rune-level page transcription](../resources/lp2-transcription.txt) reproduces all **13,136** rune indices including solved p56 and clear p57, without any index disagreement.
- In the transcription, actual `-` and `.` word separators yield exactly **2,896** unknown-page word starts; `/`, physical-page seams, annotation marks and the rune-free p50 numeric page do **not** insert fabricated word boundaries. Thus the experiment grants a no-repeat clock restart at every **actual** word, including page-spanning words.
- The original visible nine chapter lengths are **729, 1,145, 1,729, 1,903, 1,255, 1,078, 1,801, 3,008 and 308**, for p0–2, p3–7, p8–14, p15–22, p23–27, p28–31, p32–39, p40–53 and p54–55 respectively. The decisive long chapter p40–p53 begins at global unknown-rune offset **9,640** and ends at offset **12,648**. Its 3,008 indices and word-start mask are extracted directly from those canonical files.

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

The first period in the reproducible 1–29 single-phase saturation check without a 29-residue obstruction is **29**. This observation supplies **no evidence for a 29-rune key**: survival of one necessary condition is not a demonstration of decryption.

## Completely secret Fehu-bypass keys of periods 1–6

A further independent exhaustive receiver takes the same genuine 3,008 p40–p53 runes and their exact printed word boundaries. Periods **m=1..4** directly enumerate all **29^m secret GP29 keyword arrays**. For **m=5 and m=6**, an exact key-independent necessary-condition filter rejects impossible arrays before a complete inversion of every surviving key. Sign and arbitrary initial phase need no separate tuning because negations and cyclic rotations lie within the unrestricted keyword space. For every secret array, the exact finite-state decoder retains all feasible states (current key phase, previous intermediate rune); a ciphertext-F permits either ordinary non-Fehu keyed output or genuine literal-Fehu passthrough with no key advance. An earlier anti-repeat stage may restart at **every** printed word. The decoder makes no language assumptions and uses no beam or early n-gram threshold.

| Secret key period | All possible keys | Keys reaching full decoder | Full original chapter passes | Longest feasible prefix |
|---|---:|---:|---:|---:|
| 1 | 29 | 29 | 0 | 278 / 3,008 |
| 2 | 841 | 841 | 0 | 278 / 3,008 |
| 3 | 24,389 | 24,389 | 0 | 278 / 3,008 |
| 4 | 707,281 | 707,281 | 0 | 353 / 3,008 |
| 5 | 20,511,149 | 20,410 | 0 | 471 / 3,008 |
| 6 | 594,823,321 | 276,320 | 0 | 501 / 3,008 |
| **Total** | **616,067,010** | **1,029,270** | **0** | |

**Locality of the falsification is stronger than the chapter-wide test:** all m=1..6 secret-key configurations lose every exact inverse path **by original local rune 501**, before the p40+p41 physical-page boundary at **504 runes**. The longest surviving period-6 prefix of 501 includes the failed rune and cannot reach p42. The source witness span at offset 45–162 lies entirely within physical p40. Thus key-phase choices, numeric-cell clock movements, exterior image annotations, or reset conventions at later physical p50 cannot rescue this exact strict-first/periodic-last architecture; it already fails inside p40–p41. Only a different key clock/reset within those first 504 runes, a nonstrict first stage, or a changed last-layer operation escapes this source-local obstruction.

For periods 5 and 6, the authentic chapter has a contiguous **118-rune source span at offset 45–162 with no ciphertext Fehu**. Because plaintext-Fehu bypass can only produce ciphertext Fehu, every rune in this span must consume the final keyword. Rotating the cyclic key array sets its unknown phase at this span start to zero without excluding any possible secret. For each phase jj, the key value `K[j]` cannot equal any original ciphertext value at that phase in the span; otherwise the intermediate rune would be Fehu and should bypass rather than become non-Fehu. At each genuine within-word adjacent original pair, the key difference `K[j]-K[j-1]` cannot equal the observed ciphertext difference, or the intermediate first-stage output would repeat a rune. These are *necessary conditions*, so pruning on them is exact. It reduces the period-5 search from **20,511,149 to 20,410** candidates and the period-6 search from **594,823,321 to 276,320**. Every survivor was decoded over all **3,008 original runes**, keeping exact key phase, previous intermediate rune, alternative Fehu bypass and every possible starting phase without language-model pruning. No full-chapter path survives. Independent clear-p57 source-native plants using period-5 and period-6 keys **pass** the same decoder and necessary filters. [Dedicated period-5/6 SFT](../sims/lp2_layer2_reverse_ftransparent_constraint_sft.cjs), committed and reproduced with the exact original inputs.

A separate **positive** native-GP plant with each of the four shorter secret periods, including literal Fehu skips, is accepted by the original decoder. This is a finite exhaustive exclusion of a highly motivated class under the stated clock and no-repeat constraints. The following extension covers periods 7 and 8; other clocks and inner substitutions remain outside this test.

## Exact unrestricted periods 7 and 8 (24 November 2026)

On the same source-exact 3,008-rune p40–53 chapter, a two-state-action bitset automaton tracks all possible phases for previous consuming versus literal-Fehu output. Known key digits forbid a consuming inverse equal to F; two known consecutive key digits forbid a repeated intermediate symbol inside a printed word when their difference equals the observed ciphertext difference. Consecutive literal holds are forbidden inside words; a mixed hold/consume pair cannot repeat. Unknown key digits relax these constraints, making partial-key reachability a necessary condition for any completion; fully assigned keys give exact reachability. Start phases are unrestricted. Rotational canonicalization is valid because the starting phase is free. The one-/two-digit reachability sieve tests every relative separation, then DFS tests all compatible partial assignments with exact relaxed reachability at each depth. No plaintext scoring, alphabet restriction, or search cap is used.

| Period | Two-digit pair counts by separation | Surviving assignments at depths 3 / 4 / 5 | Complete keys |
|---|---|---|---:|
| 7 | 87, 509, 510 | 9 / 1 / 0 | 0 |
| 8 | 278, 694, 717, 718 | 28 / 5 / 0 | 0 |

All 517496289270 possible raw arrays at these two periods are thereby excluded by necessary-condition pruning, not enumerated individually. Two 3,008-rune controls generated from the same native donor stream via two nonzero modular differences per GP symbol, followed by hidden q7/q8 literal-F Vigenère keys at phase 3, recover the unique exact canonical key classes. These are key-recovery controls; intermediate/plaintext reconstruction was not performed. Runtime V8 17.569 s including both controls; the original searches used 2,796 / 4,804 reachability calls. The committed Node wrapper was not separately run. [SFT](../sims/lp2_layer2_reverse_q7q8_partialkey_sft.cjs) · [raw output](lp2-layer2-reverse-q7q8-partialkey-output.json). This is a language-independent all-key exclusion of the stated strict-first, chapter-continuous q7/q8 last-stage cipher, not an exclusion of anti-repeat-last or nonstrict first layers.

## Exact unrestricted period 13 by compressed phase SAT (24 November)

The historical LP1 KOAN consuming key period 13 is a separate motivated target. Encode the same strict-first, literal-Fehu-last architecture as a Boolean satisfiability instance. One-hot variables K[j,a] and D[j,d] represent each GP29 key digit and its cyclic preceding-key difference; all 29² possibilities enforce D[j]=(K[j]−K[j−1]) mod29. Each maximal nonzero ciphertext interval has one phase label; singleton ciphertext zeros have independent hold Booleans. For a consuming rune the key cannot equal the ciphertext; two neighboring consuming runes within an original word forbid the observed delta from the associated key-difference variable; two neighboring literal holds are forbidden inside words. Mixed actions cannot give equal intermediate runes. Block transitions exactly preserve the consuming clock. The longest original no-F interval starts at offset45, so fixing phase0 there is solely cyclic key-rotation symmetry breaking, not a key constraint. Start phase elsewhere remains free. This formula is equivalent to existence of a valid key and intermediate tape, without language assumptions.

**Original p40–53, 3,008 runes: Z3 4.13.3.0 returns UNSAT in 62.990 s** (4,129 Boolean variables, 112,948 unique clauses). Thus all 29^13 raw key arrays and every feasible literal-F hold path are excluded. A constant nonzero affine multiplier (including standard Beaufort) changes neither the forbidden equality nor the F constraint, so the result covers that fixed multiplier too. No original prefix or plaintext is claimed. A q7 800-rune prefix independently gives UNSAT in 0.492 s using the same formula. The positive native-derived 3,008-rune two-delta transport control with its true rotated q13 key supplied is SAT, and a returned path exactly replays all ciphertext; only 2,432/3,008 intermediate symbols equal the planted path because legal hold paths need not be unique. This is known-key feasibility, not blind key recovery. A separate unknown-key control is not yet a completed result. [SAT SFT](../sims/lp2_layer2_reverse_q13_sat.py) · [output](lp2-layer2-reverse-q13-sat-output.json). Run with Python 3 and native Z3 library (install z3-solver or set Z3_LIBRARY); local Linux run used Z3 4.13.3.0 and the source-matched packed fixture. No Windows execution claimed. Do not interpret this solver result as a proof of the manuscript's actual architecture or an exclusion of nonstrict intermediate streams.

## Exact fixed-key Fehu-bypass branch

The historical 30-word catalog is exactly the source-fixed `WORDS` list in [the existing terminal test](../sims/lp2_layer2_terminal_zerooffset_sft.cjs), including `DIVINITY`, `FIRFUMFERENFE`, `CIRCUMFERENCE`, `WELCOME`, `KOAN` and `THEPRIMESARESACRED`. Its GP transliteration and historical aliases are unchanged.

The reverse-stage decoder initializes **every** possible keyword phase and consumes the complete original ciphertext rune by rune without beam pruning. For each rune, it allows the ordinary key-consuming branch; with the authenticated Fehu bypass enabled, the rune `q=F` instead emits `c=F` and does **not** consume the key. The candidate state retains the exact keyword phase and previous intermediate rune. A state is discarded immediately if its intermediate rune repeats the preceding one within a genuine printed word; the chapter-only version also checks across all word boundaries.

The complete test matrix consists of **30 keywords × 2 signs × 2 Fehu modes × 9 chapters × 2 strict-clock conventions = 2,160 original-input tests**. Each chapter starts with every possible final-key phase. **Zero** of these tests admits a full-chapter intermediate stream. The maximum original feasible prefixes across the 30 words/signs/Fehu modes, allowing a first-stage restart at every printed word, are:

| Original chapter | Runes | Largest surviving prefix |
|---|---:|---:|
| p0–p2 | 729 | 285 |
| p3–p7 | 1,145 | 200 |
| p8–p14 | 1,729 | 274 |
| p15–p22 | 1,903 | 234 |
| p23–p27 | 1,255 | 225 |
| p28–p31 | 1,078 | 238 |
| p32–p39 | 1,801 | 200 |
| p40–p53 | 3,008 | 231 |
| p54–p55 | 308 | 267 |

Some arbitrary configurations admit 150–285-rune prefixes, but none decodes a complete original chapter and none recovers authenticated prose. No n-gram optimization, unknown key offset, learned keyword, dictionary, or scoring threshold was used for this exclusion.

## Independent positive and limits

The reproducer synthesizes a strict no-doublet first-layer stream from original **clear p57 GP runes**, repeating that 95-rune source to original-shaped lengths. A final Fehu-transparent Vigenère using the 13-rune historical candidate `CIRCUMFERENCE` is planted at lengths **729, 308 and 3,008**, different signed keys and nonzero initial phases; **all three** pass exact reverse decoding with and without wordwise anti-repeat resets. A separate **3,008-rune, unrestricted 28-symbol hidden-key** no-Fehu plant retains at least one allowable key delta per phase, so the supposed all-secret contradiction correctly **does not** fire. The exact original-input and positive assertions passed under V8 and under Windows Node 22 CI: [periods 1–4 runner 44058743095](https://github.com/FlareZ123/liber-primus/actions/runs/44058743095) and [periods 5–6 runner 44062441656](https://github.com/FlareZ123/liber-primus/actions/runs/44062441656), both completed successfully.

**Remaining live possibilities:** the historically favored anti-repeat-**last** order, a first-layer mechanism that *allows* adjacent output doubles (the distinct coin model), an independently sourced Fehu-bypass final key of period 9–12 or ≥14 outside the frozen 30 historical keywords, final-key resets or advances inside a chapter, inserted/deleted runes, nonadditive or dynamically varying final substitutions, and other manuscript mechanisms. This is a targeted negative that removes a whole branch of speculative historical two-layer work. It does not close [Director issue #1339](https://github.com/FlareZ123/liber-primus/issues/1339), whose genuine original anti-repeat-last positive/negative campaign remains open.
