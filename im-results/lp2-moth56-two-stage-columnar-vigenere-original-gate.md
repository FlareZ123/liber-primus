# Moth-page 56 donor words as two-stage transposition/Vigenère page keys

**Agent39, 18 November 2026. Original-source bounded negative; no unknown LP2 plaintext or author key recovered.**

Physical p53 and p55 carry related moth illustrations. The former contains **40** complete printed GP29 words; p55 contains **17** displayed fragments, of which the first is a single `NG` continuing a word from p54. The remaining **16** form complete printed words. Taken in physical reading order, those **40+16=56** donor words exactly count the unsolved physical p0–p55 positions, including the numeric-only p50. This suggests a finite possible assignment: donor word *i* is a cipher key for original physical page *i*. The 56 donor lengths are source-fixed (254 key runes total), and no keys are recovered from alleged unknown plaintext.

The earlier Cicada stages used GP29 Vigenère and a keyed columnar transposition, motivating a **two-stage** decoder which differs from the previously tested direct moth-word Vigenère donor. For each of the 55 rune-bearing original pages, use the assigned donor's GP index string both as a repeating additive mod29 key and as a stable-sorted irregular-columnar permutation (ties in printed key order). Read ciphertext in physical rune order, with the actual page extent, without resizing words. Evaluate only these **four** conventional inverses: columnar then minus/plus Vigenère, or minus/plus Vigenère then columnar. The runeless p50 consumes its assigned donor position but contributes no ciphertext. Each inverse is checked by exact re-encryption of the original page, and no phases, keys, or word delimiters are fitted to decoded output.

| Frozen original inverse | Global decoded IoC on 12,956 runes | Pages with IoC ≥ 0.05 /55 |
| --- | ---: | ---: |
| Columnar first, subtract donor | **0.03444518** | **0** |
| Columnar first, add donor | **0.03446572** | **0** |
| Vigenère first, subtract donor | **0.03447187** | **0** |
| Vigenère first, add donor | **0.03447739** | **0** |

The GP29 uniform coincidence level is **1/29 = 0.03448276**. The maximum isolated page IoC across the four variants is **0.04132824**, on original p51 (92 runes); none approaches ordinary native GP-English concentration at a substantial page length. All four reconstructed streams are flat and nonlinguistic. The per-page top outputs and exact summary were computed directly from `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`. The [source-native single runnable CommonJS program](../sims/lp2_moth_56word_columnar_vigenere_original_sft.cjs) reads these original-derived files itself, asserts the 40+16 split, all source sizes and every inverse-to-forward identity, and reports all four outcomes.

**Decision:** retire this specific 56-page donor-key assignment and four straightforward historical two-stage receivers. The original moth pairing and donor cardinality are interesting visual/count observations; the manuscript does not explicitly prescribe these keys, recipient pairing, cipher order, padding or transposition semantics. This negative does **not** exclude a different operator or independent original selector, and cannot establish why moth art is repeated. No arbitrary expansion of donor rotations, sign phases or key shuffles is justified by these outputs.
