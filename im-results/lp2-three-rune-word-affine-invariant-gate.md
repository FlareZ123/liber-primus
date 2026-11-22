# Original LP2 three-rune word shapes exclude independently affine-keyed native English

**Agent43, 12 November 2026. Classification:** substantive, key-independent rejection of an unusually flexible word-local cipher family on the unmodified original ciphertext, with full source-native controls. **No previously unknown plaintext, authentic original key, mechanism or destination has been recovered.**

## Clue and the restricted cipher architecture

Original physical p27 and final unsolved p55 independently display the exact duplicated 3+3-rune phrase **DJU BEI**. In a candidate raw-Latin plaintext, `BEI` can map to `END` through one invertible GP29 affine alphabet `P=20C+26 mod29`, but `DJU` cannot map to `THE` through any affine alphabet; see the [terminal-crib source gate](lp2-rawlatin26-terminal-crib-register-gate.md). This motivates testing *all* printed three-rune words instead of fitting a local phrase.

Assume an encrypted book encodes each **original complete rune word** independently under its own entirely arbitrary invertible affine alphabet over `GF(29)`: `C[i]=a_word P[i]+b_word mod29`, with **a_word any nonzero field element** and **b_word any of 29 values**. Every one of the 720 original printed three-rune words is allowed a different secret pair (`28×29 = 812` possible keys per word), with no shared word clock, position, original key, or guess at plaintext. Such an encryption preserves printed word boundaries and plaintext rune length. Unlike fixed-per-page or per-word-length alphabets, it grants complete secret key independence between all word occurrences.

For a three-rune word `x=(x0,x1,x2)`, define the shape `S(x)=(x2−x0)/(x1−x0) mod29` when `x1≠x0`. Reserve special category **29** when `x1=x0`. This 30-way invariant survives *all 812* possible affine letters for every word, including the special equality category. It is an exact necessary condition, independent of English scores and key recovery.

## Original data and independent source controls

Read the genuine LP2 rune transcription in print order, joining only line/page wraps and preserving hyphenated word breaks, numeric-only p50 omitted. Among exactly **2,896 original words / 12,956 runes**, there are **720 complete three-rune words**. Compute the 30-category `S` histogram and its same-class collision rate `sum_s n_s(n_s−1)/[720·719]`. It is **18,204 / 517,680 = 0.03516458043579**, near the 30-category uniform 1/30 benchmark.

Three independently pinned Shakespeare, Gibran and Emerson English sources are encoded into the canonical 29-rune GP spellings with `ING,TH,NG,EO,OE,AE,IA,EA` as one rune each (plus conventional `QU→CW, V→U, K→C, Z→S`). A separate raw-Latin control treats every Latin letter as one GP symbol and folds the four absent letters via **K/Q→C, V→U, Z→S** to obtain a fixed, explicit valid 29-field alphabet. That raw-Latin folding is a comparison **convention**; a different unknown 26-to-29 injection lies outside it.

| Source | Register | All source three-rune words | Full-source shape collision rate | Minimum among 1,000 matched 720-word resamples |
| --- | --- | ---: | ---: | ---: |
| Shakespeare | Native GP | 12,988 | 0.06588249 | **0.05585304** |
| Shakespeare | Raw Latin, four letters folded | 11,415 | 0.08705570 | **0.07509658** |
| Gibran | Native GP | 4,000 | 0.10392273 | **0.08505254** |
| Gibran | Raw Latin, four letters folded | 4,253 | 0.13940378 | **0.11697187** |
| Emerson | Native GP | 16,897 | 0.08150534 | **0.06787204** |
| Emerson | Raw Latin, four letters folded | 18,585 | 0.13563933 | **0.10992891** |
| **Original unknown LP2** | Printed GP glyphs | **720** | **0.03516458** | N/A |

The **6,000** source controls sample exactly 720 genuine reference three-rune words with replacement, using deterministic xorshift32 seed `0x43524343`. **0/6,000** controls reach the original's collision rate. The source profiles have frequent repeated affine shapes, driven by real recurrent English words even when their ciphertext is subjected to independent affine substitutions; original three-word shape classes are much closer to flat. These are finite-language/calibration frequencies, not independent proof that the manuscript's hidden original plaintext is English. The repeated word sampling may magnify a source's unusually frequent words; it is a concrete null for this exact original-word-length hypothesis.

An independently generated **720-word / 2,160-rune** Gibran GP plant is encrypted using a **new independent, seeded affine a,b for each word** and decrypted using the exact modular inverses. **2,160/2,160** planted runes recover and the shape collision statistic is invariant *exactly* across encryption/decryption. No observation of the synthetic key is needed for the original all-secret exclusion. The published [standalone original-input SFT](../sims/lp2_word3_affine_shape_all_secret_sft.cjs) asserts 2,896/12,956 and 720 original counts, original 18,204/517,680 statistic, six source size fixtures, all source sample rates above original, and exact full plant recovery.

## Decision

**The original LP2 ciphertext strongly rejects native-language English text encrypted with a different arbitrary affine GP29 substitution for every printed word**, if ciphertext word lengths and boundaries are preserved. This is an exact all-secret obstruction for a much more general word-keyed model than repeating a fixed Caesar, Vigenère or title-key substitution. It helps retire extending the source-visible `DJU BEI` terminal clue into arbitrary wordwise affine keys. The result applies to the whole book and has not been inferred by choosing any candidate plaintext words.

**Unresolved:** keyed *nonaffine* permutations per word, variable-length words or shuffled punctuation, alternate language registers, hidden alphabet-order permutation, word-order transposition, plaintext assembled from nonstandard source words, and genuinely state-dependent ciphers. A real creator-selected operation producing original recovered plaintext is still required; this exclusion cannot supply one.
