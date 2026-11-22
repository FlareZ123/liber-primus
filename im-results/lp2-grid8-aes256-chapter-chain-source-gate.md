# Eight 32-byte table columns as chapter AES-256 chain keys: original-input gate

**Status:** bounded negative candidate test, 15 November 2026 (Agent27). **No unknown plaintext, source-authenticated AES instruction or recovered keystream.**

## Specific plausible route to plaintext

Physical LP2 pages 49–51 contain the original **32-row × 8-column** numerical table. Canonical base60 cell decoding produces exactly eight **32-byte vertical columns**, while the unsolved runic transcription has eight `$`-delimited *transcription groups*, which differ from the **nine visually delimited sections** in the [original image atlas](lp2-global-original-visual-section-map.md) of lengths **729, 1,145, 1,738, 1,894, 1,021, 1,433, 1,680 and 3,316 runes**. This offers a **hypothesized transcription-group cardinality match** for eight distinct **AES-256 keys**, one per group. Because the original images delineate nine sections, the proposed eight-key schedule lacks a faithful source-visual selection. The unsupported step is the choice of AES-256-CTR and zero IV; no authenticated first-party cue currently selects those details.

To respect the original highly suppressed adjacent-equal rate, the test uses the independently known **chained GP29/28-rank hypothesis** rather than a conventional additive GP29 OTP already excluded by key-independent source statistics. Given previous ciphertext rune `cPrev`, current ciphertext `c`, and AES-CTR keystream byte `k`, define:

- `delta = (c - cPrev) mod 29` (start with `cPrev = 0` separately for each of the eight source segments).
- If `delta = 0`, decode the source's 29th GP symbol **EA** (index28), a zero-step sentinel.
- Otherwise `p = (delta - 1 - (k mod 28)) mod 28`, using GP29 plaintext indices 0–27.
- Advance one AES byte per rune, including EA sentinel runes. AES key `K_j` consists of row0..row31 values in printed column `j`; CTR IV is sixteen zero bytes, freshly reset for each chapter.

The reversible encoder is implemented alongside the original ciphertext decoder in the [read-only CommonJS source test](../sims/lp2_eight_column_aes256_chapter_source_sft.cjs). A **source-native positive plant** encrypts the real **95-rune clear LP2 p57 PARABLE** with the first candidate key and recovers all 95 runes exactly; every original chapter also roundtrips numerically under the same operator. These roundtrips validate the implementation only.

## Result on untouched original runes

The [Windows Node22 original-source run 43710927484](https://github.com/FlareZ123/liber-primus/actions/runs/43710927484) passes with the full canonical 12,956-rune unknown ciphertext, the original base60 table and exact visual-segment boundaries. Its outputs are:

| Source input | GP29 symbol coincidence probability |
| --- | ---: |
| Original unknown ciphertext pp0–55 | 0.03447840 |
| Candidate decoded pp0–55 (all eight column keys) | **0.03526745** |
| Real clear GP29 p57 positive-control plaintext (95 runes) | **0.06270997** |

Each of the eight candidate-decoded sections has GP29 coincidence probability between **0.034806 and 0.035822**, far from the source-native clear p57 register. The first 120 decoded runes of every section, printed in the runner output, yield no coherent natural-language plaintext. The candidate marks **87** GP symbols as EA, due to its zero-step rule and one segment-initial zero. Its synthetic reversibility does not make the original output authentic.

**Decision:** retire this **exact source-key/operation tuple** (vertical table keys in printed order, AES-256-CTR, zero IV, key byte per rune, original per-segment reset, chained 28-symbol decode). A differently sourced IV, selector or genuinely motivated generator remains untested; do not rescue this failure by tuning parameters without independent manuscript clues. This result is intermediate rather than a new cipher mechanism.

## Reproduction

- Inputs: [canonical physical LP2 corpus](../resources/liber-primus/lp2-corpus.json), [unchanged printed transcription](../resources/lp2-transcription.txt), [canonical 32×8 byte table](../resources/liber-primus/base60-grid.json).
- Source and plant: [single runnable Node22 CJS test](../sims/lp2_eight_column_aes256_chapter_source_sft.cjs).
- [Completed Windows CI source run](https://github.com/FlareZ123/liber-primus/actions/runs/43710927484), exact original corpus, all eight key SHA-256 fingerprints and decoded prefixes.
