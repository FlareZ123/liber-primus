# Fixed p50 full-table quotient key on original p55 (Director #392)

**Decision (2026-11-11): the two frozen direct additive inverses fail.** No unknown Liber Primus plaintext, authentic key, or destination is recovered. The complete original p55 record remains encrypted. This is a bounded negative for using the first 76 **row-major, base-60** quotient digits of p50 directly as a continuous GP29 additive key.

## Source-driven premise and fixed decoding contract

The original 32×8 p49–51 table has 256 two-character base-60 tokens, represented by `resources/liber-primus/base60-grid.json` (original JPEGs 66–68). Decompose each source byte as `B_i=29Q_i+R_i`, with `Q_i=floor(B_i/29)` in 0..8. The p49 source marker is a **10-dot 3×7 alternating stencil**, while the p55 marker is a distinct **13-dot 3×9 stencil** ([original-image correction #379](https://github.com/FlareZ123/liber-primus/issues/379)). The claimed matching 3×3 marks were a transcription-level error. Nine-valued Q follows from arithmetic only; **no original source selects it as a p55 key**. This direct target is distinct from previously negative p49/p51 flank-key use and from the separate skip-aware #374.

Use **only** `Q[0..75]`, original printed row-major order, anchored at cell 0. The target is **all 76** p55 indices in `resources/liber-primus/lp2-corpus.json`, including the incoming carry and all exterior runes. Test `P−=(C−Q) mod29` and `P+=(C+Q) mod29` under the canonical 29-symbol rune order. No repetition, skip, red-channel removal, offset search, phase, reversal, alternative radix, or page/word reset.

The exact fixed 76-symbol Q sequence is:

```text
7 7 5 6 3 8 4 6 3 8 5 7 8 0 6 7 4 6 0 1 3 4 2 3 3 6 5 0 5 2 4 4 3 3 6 1 1 2
4 0 2 2 0 2 7 3 6 2 8 0 1 2 2 5 5 2 8 4 5 2 3 6 4 1 4 8 0 6 6 2 5 3 5 2 7 6
```

## Original-input outcome

Scores use the same archived Duko Round27 English quadgram counts as the earlier p50 high-digit test: mean log10((count or 0.01)/7,266,795) per Latin quadgram, after canonical GP29 transliteration. GP symbol expansions such as TH and NG change Latin string length. Larger (less negative) scores indicate more English-like text.

| Original or decoded 76-runic stream | Latin quadgrams | Mean log10 score | Outcome |
| --- | ---: | ---: | --- |
| Raw original p55 | 92 | −7.3795271257 | Ciphertext-like |
| `C−Q mod29` | 89 | −7.4404237585 | No recognizable words |
| `C+Q mod29` | 89 | −7.8208439240 | No recognizable words |
| Solved p57 first 76 runes, native-GP control | 77 | −4.3683459632 | Recognizable English |

The two candidate Latin transliterations, exactly as computed, are:

- `C−Q`: `XEXRRWPHTWWEASTHMOEDEBRIAOTHXAEDNIXEAUNCEXJEPMIAJIABGCTHGTLENREOUITWHYFSNIANGULIPEAEOEHAESJR`
- `C+Q`: `EAOATIDNGLOEDBPTHTHTHWTHUBGRJGLTHGMIAONBJAYPLBIAIASTHBIMHELWEJHTJLLDTWRNGNGGDNWIAEJTEAXGMAET`

With 3,000 deterministic Fisher–Yates shuffles of the same fixed Q multiset (xorshift32 seed `0x392569f1`), **935/3,000** shuffled subtract-keys score at least as well as the source order; **2,516/3,000** shuffled add-keys score at least as well. These are within-family descriptive comparisons, not formal significance estimates for the entire unknown cipher space.

**Positive and wrong-key controls:** Encrypt the first 76 *clear* runes of solved p57 using `Cplant=(P57+Q) mod29`. Applying the correct subtract inverse recovers all 76 runes exactly (score −4.3683459632); the planted ciphertext scores −7.7792361619. Rotating Q by one position and subtracting from the plant fails to recover plaintext (score −7.6299343629). Both p55 candidate streams exactly forward-re-encrypt to original ciphertext under their respective additive conventions. Such bijective replay proves implementation consistency but does not authenticate a key.

## Scope and research decision

The fixed direct quotient-to-p55 additive model is exhausted under both directions. The red 10-dot and 13-dot source marks cannot supply a shared nine-state selector; direct GP29 addition is not source-authenticated. Do **not** treat exact forward replay as plaintext evidence, adjust offsets to improve scores, or merge this exclusion with the independent skip-aware #374 or direct-R #387. Neither full Q nor Q's general use is proven meaningless. A successor should require an independent source-native rule that fixes a distinct reversible consumer before checking original p55 output.

**Exact reproducibility:** `sims/p50_full_quotient_p55_direct_key_sft.cjs`. It reads checked-in original-derived source files, asserts their grid SHA-256, locks both ciphertext streams, validates planted recovery and wrong-key control, and prints all 76 raw/key/output indices plus scored results. [GitHub Actions manual positive execution, run 43107112141](https://github.com/FlareZ123/liber-primus/actions/runs/43107112141), `grid-256-tests.yml` probe `p50-q55`. The original table high-digit decomposition and other bounded failures are independently documented in [p50 high-digit source gate](p50-base29-high-digit-radix9-source-gate.md).