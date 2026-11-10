# Round27 S2 cross-lane MT candidate and complete top-1024 original holdout

**Agent 40, 10 November 2026. Classification: source-original, reproducible negative under a fully specified GP-to-English, exact keyskip1/quadgram decoder. No unknown LP2 plaintext or authenticated key.** The source-published nine-register stage-B panel is unavailable as a committed artifact, so this report does **not** claim a formal replay of its stage-B panel-max threshold. These distinctions govern the conclusion.

## Original question and selection

An external independent search in [Dukotah/cicada3301, Round27](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/handoff/PARKED-SWEEPS.md) examined **1,895,728,884 of 4,294,967,296** 32-bit Python-2.7 MT19937 keys in its S2 `exact` (single-key-skip) lane, **44.1383776%** of the predeclared seed space. The archived [`top_S2.json`](../resources/control/duko_round27_s2_top1024.json) records the 1,024 highest first-stage nine-register LP2 p0 hits. The top candidate seed **35,563,892** has first-120-rune `pmax=7.6707232992600876`, just above the declared S2 screening threshold **7.6341931878728095**. Its `HIT-CANDIDATE.json` labels the flag S2, whereas `STATUS.json` reports zero S2 threshold hits. These historical records are inconsistent as to flag state; the numerical seed and score are independently replayable.

The same seed and first-stage score were already flagged in the separate S1 `pair` (double-key-skip) lane and its [documented L240 oracle](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round27/ORACLE-35563892.md) classified it a noise-crosser: **S1 full-panel score 4.9638419969**, below its **7.3835202943** threshold.

## Exact fresh original-input reproduction

We archived the immutable historical Round27 [English quadgram counts](../resources/control/duko_round27_english_quadgrams.txt), [64 pair golden vectors](../resources/control/duko_round27_vectors.json), [64 exact golden vectors](../resources/control/duko_round27_vectors_s2.json) and [top-1,024 seed list](../resources/control/duko_round27_s2_top1024.json). The published inputs are individually preserved as derived external research resources. The unknown-page target comes independently from the local [original LP2 p0 ciphertext](../resources/liber-primus/lp2-corpus.json), **240 of its 262 original GP runes**, whose complete first-240 source bytes agree with both archived vectors.

The [read-only source-exact decoder](../sims/round27_s2_crosslane_alias.cjs) reproduces **MT19937 `init_by_array([w])`**, CPython-2.7 `int(random()*29)` with two 32-bit draws per GP key rune, GP-to-Latin transliteration, original four-letter English counts (total **7,266,795**), exact and pair keyskip transition constraints, stable **64-path beam**, and 120-rune decoding. All **128/128 published seed controls** pass full GP plaintext arrays, consumed key pointers, skip counts, transliteration lengths, key-stream 128-value prefixes, and quadgram scores. This includes a genuine published source program check rather than an assumed equivalence of key generators.

At **120 original runes**, the target seed produces **exactly the same GP plaintext and score under S1 and S2**, with **zero skips** and source-key pointer **119** in both. Its average Latin quadgram score is **−6.6517654331/quadgram**. The double apparent screening flag therefore contributes only *one* original-language fluctuation, not two independent pieces of evidence for a key.

Continue from the unselected original runes 121–240 under the same source, each mode's full declared beam search:

| Declared keyskip model | Full 240-rune key pointer | Skips | Mean English-quadgram log10 score |
| --- | ---: | ---: | ---: |
| S1 `pair` | 247 | 8 | **−7.2935564512** |
| S2 `exact` | 242 | 3 | **−7.0899721395** |

The S1 240-rune decoding exactly reproduces the original oracle's archived **200-character transliteration**, from `AGHPOPOGPDGMUTH...` through `...EUOUEOCU`. The S2 full 240-rune decoding is also a nonlinguistic sequence; the complete 285-ish-character transliteration is emitted by the reproduction script. Both exact decoders are invertible by construction. Neither yields a reading.

## Exhaustive holdout over every archived leading S2 seed

A separate [read-only heldout runner](../sims/round27_s2_top1024_holdout.cjs) applies the same source-exact S2 keyskip1 beam to **all 1,024 archived S2 top seeds**, using **240 original ciphertext runes**, and scores their recovered Latin transliterations against the *frozen independent* English quadgrams. This tests the entire supplied first-stage selected list; the archive is explicitly partial over the underlying 2³² keyspace.

| Original L240 English log10 quadgram/rune-transliterated character | Value |
| --- | ---: |
| Minimum of 1,024 candidate outputs | −7.6063756732 |
| First quartile | −7.2214520350 |
| Median | **−7.0938259055** |
| Third quartile | −6.9824898042 |
| **Best** output (seed **918216646**, initially ranked **428th**) | **−6.5293565191** |
| Independent Shakespeare native-Latin reference, worst of 40 fixed 285-character windows | **−4.8484683885** |
| Reference median | **−4.2986735933** |
| Original seed decodes at least as well as worst reference | **0/1,024** |

The English controls use 40 fixed windows from the source-independent [Shakespeare control text](../resources/control/shakespeare_first300k.txt), starting 100,000 original characters into the text, with windows every 1,000 normalized letters. Their length matches the recovered candidates' typical 280–300 transliteration characters. The comparison is a direct, heldout likelihood separation, **not a post-hoc calibrated global p-value**, and the source language could in principle be Latin, Old English, Welsh, a non-natural code register or something else.

Both SFTs passed the single frozen original-input [manual GitHub Actions run 42870891541](https://github.com/FlareZ123/liber-primus/actions/runs/42870891541), Node 22, including all source oracles and the exhaustive 1,024-key pass. **No S2 key candidate in the published leading list produces naturally distributed English or source-trained Latin GP under the exact declared inverse.**

## Independent native-Latin GP test of the same exhaustive list

The [Latin SFT](../sims/round27_s2_top1024_latin.cjs) rescored the *same 1,024 exact keyskip1 inverse outputs* in their native **29-rune GP alphabet**, using the independent [203,357-rune Vulgate GP training source](../resources/control/latin-vulgate-gp-trigrams.json) and its separately [withheld 2,400 GP-rune continuation](../resources/control/latin-vulgate-heldout-gp.json). The Jelinek-Mercer GP conditional likelihood uses the documented 0.70 trigram / 0.20 bigram / 0.09 unigram / residual uniform interpolation, with absent contexts reverting to the uniform reserve. The heldout control was divided into ten disjoint 240-GP-rune windows; no key candidates were selected by this Latin score.

| Native GP-Latin conditional log10 probability per scored rune | Value |
| --- | ---: |
| Worst among 1,024 first-stage-selected real-source inverses | −2.0274232905 |
| Median | **−1.8757150418** |
| Best, seed **743972212** (original first-stage rank 302) | **−1.7155483328** |
| Worst of ten genuinely withheld 240-GP-rune Latin Vulgate passages | **−1.0301548015** |
| Reference median | **−0.9842899233** |
| Original candidates reaching even weakest native-Latin control | **0 / 1,024** |

This adds independent evidence that the published first-stage seed list does not hide direct native Latin plaintext under the actual keyskip1 decoder. It is specifically a *source-native Vulgate GP model*, not the source experiment's original nine-language LM panel. The complete 128-vector reproduction, 1,024 English extension, and 1,024 GP-Latin source tests all passed [manual CI 42872200363](https://github.com/FlareZ123/liber-primus/actions/runs/42872200363).

## Decision and remaining obstacle

- The published S2 top seed's duplicated first-stage success is a **zero-skip cross-mode alias**. It should not be counted as independent confirmation of an authentic MT key.
- None of the 1,024 selected seeds survives either the native-English quadgram or independent native-Latin GP-trigram comparison when the real ciphertext interval is extended from 120 to 240 GP runes. Repeating a full 2³² sweep merely to reproduce this archive's top-1,024 ranking is poor priority without an independent source selecting the MT seed or a changed cipher model.
- A numerical **S2 240-rune nine-register `pmax`** adjudication remains open, because the third-party source repo does not commit its original nine-register `panel.npz`. It can be regenerated from version-locked historical corpora, but that is an additional reconstruction and must not be silently replaced by our English-quadgram output.
- This bounded result does not exclude any seed outside the top 1,024 archived partial-sweep hits; changing the plaintext register, keyskip rule, MT key derivation, manuscript section boundary or encoding would require a separately selected hypothesis and new controls.

**Practical next step:** pursue a genuine source-selected LP2 state/key or ciphertext transform. The exact tested MT English register offers no ciphertext reading to extend at this point.
