# Prior printed-word prime sum as a causal 32×8 numerical-table key

**Agent 14, 14 November 2026. Original-input bounded negative.** The eight fixed, reversible decoders below do **not** recover GP-native English from any of the 12,956 unknown LP2 rune positions. They recover no authenticated plaintext, creator key, cryptographic method or destination.

## Why this source-led consumer is different

The signed January 2016 Cicada message calls the words a map and their numbers a direction. The original manuscript itself supplies Gematria Primus **prime values**, exact printed **word boundaries**, and a **32-row × 8-column** table of 256 numbers. The simplest two independently legible word numbers are a prior word's **GP prime sum** and the current word's **length**.

For each complete printed ciphertext word `w`, index **row = (sum of GP primes of the previous published ciphertext word) mod 32**, starting with publicly fixed empty predecessor sum zero. Index **column = current printed word length mod8** or **(length−1) mod8**. Let `b` be the byte read from the row/column cell under the conventional but not creator-authenticated base60 interpretation. The two fixed projections are `k=b mod29` and `k=floor(29b/256)`. The entire current word uses the single shift `P=(C±k) mod29`. The next row is computed **from the actual preceding ciphertext word**, so an inverse encoder recovers that published state exactly; no unknown plaintext is needed to select the key.

The four source numbers (word GP prime sum, printed word length, table row and table column) have clear physical origins. **The weakest assumption remains that the creator chose this exact word-level indexing/GP29 additive operation. No authenticated instruction says so.** The table's radix60 is likewise conditional; the signed 2013 protocol supplies BASE29, with no verified LP2 radix60 instruction.

This is distinct from the already completed **same-current-word ordinal and within-word rune-offset indexing** in [the earlier table gate](lp2-original-grid-wordposition-source-key-gate.md). The new model has a causally evolving **previous-cipherword prime-sum state**, rather than a fixed global word index, and uses the whole-word number to select one key for its successor. Its exact reversible past-ciphertext dependence avoids an unjustified current-word self-indexing fixed point.

## Original LP2 decisions

The original input is the unedited canonical p0–55 corpus: **2,896 complete words, 12,956 GP29 rune positions, including all 32 page-spanning words**, against the source 32×8 numerical table. All eight outputs have essentially uniform rune statistics and no contiguous readable GP text:

| Column convention | Byte projection | Arithmetic sign | GP29 IoC | Literal E count |
| --- | --- | --- | ---: | ---: |
| word length mod8 | b mod29 | − | 0.034459380316 | 439 |
| word length mod8 | b mod29 | + | 0.034507150586 | 491 |
| word length mod8 | scaled | − | 0.034477945066 | 438 |
| word length mod8 | scaled | + | 0.034468329050 | 476 |
| (length−1) mod8 | b mod29 | − | 0.034511309185 | 473 |
| (length−1) mod8 | b mod29 | + | 0.034452266609 | 449 |
| (length−1) mod8 | scaled | − | 0.034494925020 | 460 |
| (length−1) mod8 | scaled | + | 0.034484963447 | 471 |

The source-original raw ciphertext GP29 IoC is **0.034478397865**, the printed solved p57 GP text is **0.0627099664**, and the eight outputs are much too uniform for comparable ordinary English-GP prose. Their E counts are only **438–491** across the entire 12,956 positions. This is a language-register-conditional negative, rather than a proof that the model cannot encode a hidden intermediate format.

## Source-locked inverse and positive test

The [original-input Windows Node.js 22 run 43641549360](https://github.com/FlareZ123/liber-primus/actions/runs/43641549360) completed successfully. The standalone [CommonJS SFT](../sims/lp2_grid_prevwordprime_length_sft.cjs) reads the original word parser and published GP prime list; it asserts the full 2,896/12,956 shape and exact rune-for-rune equality with the canonical physical-page source, never normalizes or moves original punctuation. Every model **re-encrypts the complete original ciphertext exactly** from its own inferred plaintext because the word-address state is public and causal. Every model also encrypts the 95 genuine solved p57 GP symbols as a separate source-native plant with fresh evolving ciphertext-word states and fully recovers **95/95** with the corresponding inverse.

The original and planted forward/reverse identities demonstrate that this is a legitimate reversible proposed cipher family. They do **not** establish that Cicada used it: all eight original readouts remain nonlinguistic.

## Decision

Retire this exact **prior-cipherword-prime-sum row × current-word-length column** additive table key as a one-stage native-GP-English decoder. The 2016 signed message and the table geometry are insufficient to authenticate the current indexing and arithmetic. A source-supplied operand, actual key selection, or independently recovered intermediate plaintext would justify revisiting the table; merely changing phases and adding cipher layers would not. No known result in this file changes the authoritative [research frontier](../results/README.md).
