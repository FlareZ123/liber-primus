# LP2 nonzero 28-step chain with p49–p51 source-table key: original-cipher gate

**Agent19, 21 November 2026. Decision: the tested direct 256-token table key is rejected as a promising original-language decoder. No unknown plaintext, authentic key, complete historical mechanism, or destination recovered.**

## Source-motivated proposal

The 55 rune-bearing unknown LP2 physical pages contain **12,956 GP29 runes**. The approximately **0.66%** equal-adjacent-rune rate is far below the independent-uniform rate **1/29**. Separately, the original LP2 p49–p51 numerical table has exactly **256 printed two-character cells** in 32 rows of eight; each token admits the documented base60 numeric reading and the independently proposed drop-lowercase-`f` base59 reading. This motivates one *specific*, falsifiable architecture:

1. Let `c_i` be the canonical GP29 ciphertext index, `d_i=(c_i−c_(i−1)) mod29`, with previous state zero at page start.
2. Treat `d_i=0` as native GP index **28 = EA**, one uncommon plaintext rune; the 28 nonzero differences carry the remaining GP plaintext indices 0–27.
3. Treat the 256 table cell numbers modulo28 as the key for the nonzero step. The frozen direct model is `p_i=(d_i−1+k_i) mod28` when `d_i != 0`. The inverse is explicit: `d_i=1+(p_i−k_i) mod28`, then `c_i=(c_(i−1)+d_i) mod29`.
4. Make the minimal historical ambiguities explicit: base59/base60 table numeral, key clock continuous across physical pages or reset at each page, positive/negative ciphertext direction, key-table forward/reverse order, and the two modular key signs, **32 complete configurations**.

This is a *hypothesis*, not an established reading of the images or the signed 2016 message. The rare-EA zero-step interpretation has been discussed externally before; the new bounded experiment is its exact direct application with the canonical printed 256-token table and matched original-cipher controls.

## Original-input procedure

The primary source inputs are `resources/liber-primus/lp2-corpus.json` (physical p0–p55), `resources/liber-primus/lp2-grid-256.json` (tokens in printed order), and the independent historical-language approximation `resources/liber-primus/lp1-plaintext-reference.txt`. The latter supplies **3,234 editor-normalized GP29 symbols** via longest-match historical digraph transliteration, ignoring comments; its observed EA proportion is **21/3,234 = 0.64935%**. It trains add-one-smoothed unigram and 0.3-smoothed first-order transition log-likelihoods. Scores aggregate log unigram + within-page log-bigram evidence per original rune.

All 32 source-permitted configurations are evaluated on the **unmodified 12,956 ciphertext runes**. Original-input forward re-encryption holds identically for the winning bijective configuration on all 55 pages, as it necessarily would for *any* correct inverse implementation. A separate 300-rune native GP plaintext plant is recovered exactly, guarding against implementation mistakes.

The best original table configuration uses **base59, continuous clock, positive ciphertext difference, table forward, positive decode key**, scoring **−8.355942626440667** normalized log-likelihood units. Its first page begins `EACFXNGMPNGOGAOULHAEGAESAEFDHOTJ...`; there is no coherent original-language recovery.

## Discovery-aware matched null

In **128** deterministic controls (xorshift32 seed `0x33012026`), shuffle exactly the original 256 printed table tokens with Fisher–Yates, preserving all token values and multiplicities. For **each** shuffle, re-evaluate **all 32** configurations, both radices included, so the original's selected settings receive no free model-search advantage.

| Measure | Value |
|---|---:|
| Original best of 32 | **−8.355942626440667** |
| Shuffled best-of-32 median | **−8.343598681276122** |
| Shuffled best-of-32 at least as good as original | **118/128** |
| Monte Carlo upper-tail estimate (add-one) | **119/129 = 0.92248** |
| Source GP29 symbols tested | **12,956** |
| Test-model registrations | **32** |
| Native synthetic plant | **300 runes, exact inverse** |

The original-table score is **worse than the control median**. On this matched test there is no evidence that the source-ordered table acts as the claimed direct repeating nonzero-step key. Its exact forward roundtrip is an implementation property rather than key identification.

## Decision and scope

**Retire this specific GP28-EA-zero / 28-step / source-table modulo28 repeating direct-key family**, including the 32 frozen reading/clock/sign choices. An arbitrary new offset, keyed permutation, or unrelated clock would be a new unsupported hypothesis rather than a rescue. This result does **not** rule out genuine chained encryption, hidden source-derived state, encrypted table bytes, alternative serialization, or other GP29 alphabet operations. It does not modify the established absence of authentic unknown-page plaintext in `results/README.md`.

**Reproducer:** `sims/lp2_p50_28step_chain_original_sft.cjs`, read-only Node22 CommonJS, no libraries and no file writes; run through the existing manual Windows workflow `.github/workflows/manual-readonly-commonjs-sft.yml` with input `sims/lp2_p50_28step_chain_original_sft.cjs`. All exact values above are asserted in the script. **Independent Windows Node22 PASS:** [manual run 44936113661](https://github.com/FlareZ123/liber-primus/actions/runs/44936113661), Node 22.23.5, 21 November 2026; the run log confirms all 55 source pages, 300-rune native positive control, full original replay, 32 model registrations, and 118/128 matched-null exceedances. Minor trailing decimals differ at ~10^-13 between V8 runtimes, with all assertions passing.

**Best next investment:** a first-party source clue that actually specifies an original key/state/receiver, or recovery of otherwise missing historical key material. Do not spend additional compute tuning this failed direct-key family.
