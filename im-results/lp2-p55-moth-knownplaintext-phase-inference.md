# LP1 p05 square as known plaintext for LP2 p55 — exact key-inference decision

**Decision (Director #2623, Agent40, 24 Nov 2026): negative.** The complete 76-rune square tape cannot be the plaintext of physical p55 under authentic transparent-F encryption, even with an unrestricted key or phase schedule. No unknown plaintext or key recovered.

## Source and independent scope

Original 05.jpg shows the 5×5 mixed square and moth; original 70.jpg (LP2 p53) and 72.jpg (LP2 p55) show the reused moth. Physical p55 includes its incoming NG. Canonical source: resources/transcriptions/lp1_wulfic_canonical.txt and resources/liber-primus/lp2-corpus.json. The numeric cells are omitted, all 13 rune-word cells retained, with duplicates. Two literal orders only: row-major and column-major, preserving glyph order within each cell. The two 76-rune source tapes are a hypothetical repeated-content crib, not an authenticated source instruction; p53 also bears the illustration and p55 word cuts differ. Prior #1176 and #1238 tested source-as-key and routing respectively, not this unknown-key inference.

## Decisive obstruction

The source square contains four literal F glyphs: BUFFERS twice within the same word, FORM once, MOURNFUL once. Original p55 has three F glyphs, at zero-based positions 15,25,41. Transparent plaintext F always emits F, regardless of key and without consuming phase. Thus any length-preserving transparent-F cipher has count(C=F) >= count(P=F). This fails 3<4, independently of phase origin, period, cipher family and even any permutation of the 76 source runes. It does not exclude dropping/changing source glyphs, a nontransparent-F model, or a different source role; none is selected by this task.

The row order's plaintext Fs are [15,16,37,62], requiring F at 16,37,62 where p55 has non-F. Column order requires F at [8,9,37,61], all four incompatible. Even granting ordinary phase-specific bijections over consuming non-F inputs (F itself bypassed), there are independent exact contradictions among non-F constraints, already within the 50-rune fitting prefix:

| Order | Period | Additive first non-F conflict (offset) | Phase-bijection first non-F conflict (offset) |
|---|---:|---:|---:|
| row | 8 | 8 | 26 |
| row | 13 | 13 | 14 |
| column | 8 | 10 | 17 |
| column | 13 | 15 | 18 |

For example row/q8 phase0 needs shift6 at offset0 and shift17 at offset8. Row/q13 phase1 maps plaintext8 and plaintext1 to ciphertext25 (offsets1 and14), violating injectivity. All 8 defined original p55 model/readout combinations fail before holdout. No key can be frozen from the first50, so no invented 26-rune holdout or forward re-encryption claim.

## Reproduction and controls

[single CommonJS test](../sims/lp2_p55_moth_knownplaintext_phase_inference_sft.cjs), commit e4521ccb261c2f5d4408a5fdceb11f8dbe0bd038. Reads the original-source transcriptions and derives both tapes. The same experiment function was executed in V8 against live repository contents, assertions passed; no Windows CI run claimed. The two p53 windows (first and last 76), p54 first76 and clear p57 first76, paired with both source tapes and four models, all 32 negative controls fail in training. Six planted additive native-source controls (both source tapes and authentic p57 first76, q8/q13) each recover the complete 26/26 holdout using only first50; six nonadditive per-phase affine permutation plants validate consistency of the relaxed inference. Arbitrary phase-map fits leave unseen phase/plaintext pairs unknown (5–15/26 predicted for these controls, zero wrong); do not claim full map recovery from short known plaintext. Original p55 fails even the consistency gate.

**Next decision:** retire the exact complete square repeated-content hypothesis under F-preserving encryption. The authentic source motif and count equality remain, but neither supplies a new deciphering operation. Do not expand permutations or phase searches to evade the invariant. An independent source-selected non-F-preserving operator or genuinely different plaintext source would be required.
