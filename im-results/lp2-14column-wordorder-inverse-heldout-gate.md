# Two 14-column word-order inverses on intact LP2: no held-out key signal

**17 November 2026, Agent13. Classification:** new original-cipher word-order test, calibrated against independent genuine GP-native English plants and chapter-preserving nulls. **No unknown LP2 plaintext, authentic word permutation, original-cipher key, or final destination recovered.**

## Why this test is worth making

The authentic Cicada puzzle history includes a **14-column transposition**. The original LP2 printed word lengths show almost no adjacent English-like dependence, while suppression of adjacent equal ciphertext runes continues across printed word boundaries. These two source observations suggest one economical explanation: original English *words might have been reordered before* a continuous anti-repeat encryption. An independent permutation of already-encrypted complete words is separately excluded by the original word-edge test. The unique p27/p55 seam also occurs at 14-divisible local rune offsets (p27:28; p55:70), but that alignment was noticed after the match and is **not** independent authentication of a 14-column word permutation.

This investigation tests **two fixed 14-column layouts at the original printed-word level** without assuming any ciphertext-value inverse:

1. **Repeated rows:** within each original 14-word block of each chapter, one shared unknown permutation scrambles the 14 columns.
2. **Complete-column readout:** arrange each chapter's first `14 × floor(words/14)` words in 14 plaintext columns and read those columns in the same unknown order; preserve the chapter's incomplete remainder literally.

Both operations preserve every printed token, all original word lengths, and entire chapter word counts. Both are lossless for a known key. They are distinct from a within-rune 14-phase cipher or a free postcipher shuffle.

## Exact solver and independent holdout

Source: `resources/liber-primus/lp2-transcription.txt`, with original rune and separator rules pinned by `lp2-corpus.json`. The 2,896 printed words are split into nine original visual chapters with word counts **[158,255,383,437,224,326,378,669,66]**; source page and visual line carries remain inside a printed word. An original word's GP29 length is not changed by a trial permutation.

Independently train a 12-class adjacent-GP-word-length log-likelihood model on the supplied **15,733-word Gibran** and **55,407-word Shakespeare** English controls using their original GP29 digraph spelling rules, with fixed smoothing 1.3. The first five original chapters supply **103 complete 14-token training rows**; the remaining four, disjoint chapters supply **101 withheld rows**. A 14-node exact Held–Karp Hamiltonian-path search examines *all possible* permutations for the training adjacency weights. The learned permutation is frozen before scoring withheld original rows. The heldout score is measured against the literal column order under the same readout and identical words.

| Frozen 14-column model | Fitted first-five-chapter order (zero-based) | Training improvement | Withheld improvement | Source-preserving independent null |
| --- | --- | ---: | ---: | --- |
| Repeated 14-word rows | 12,11,5,1,4,10,13,3,9,0,6,7,2,8 | +29.995766 | **+3.513763** | **9/25** chapterwise whole-word shuffle trials did at least as well, exact refit each time |
| Fourteen complete column chunks | 8,9,13,7,5,10,0,1,3,4,11,2,6,12 | +38.089027 | **+8.064034** | **8/35** chapterwise whole-word shuffle trials did at least as well, exact refit each time |

The simple +1 empirical upper-tail values are respectively **10/26 ≈0.3846** and **9/36=0.25**. These modest null sets are controlled screening diagnostics, not final p-value claims. The authentic original has neither independently selected recovered key nor robust withheld English-length signal in these two families.

**Native original-shaped positive controls:** take the complete GP29-normalized Gibran word-length stream, preserve the same nine original chapter lengths, secretly permute fourteen columns using a fixed hidden ordering, and run the unchanged exact recovery. **Both modes recover all 14 secret column positions** from 103 training rows and produce an English-positive withheld score. The independent Shakespeare plaintext plant has a meaningful true-key withheld advantage, but fitting only 103 rows recovers **1/14** true columns. This demonstrates limited power for some native-English registers: failures here do not exclude every historical original word-level transposition.

## Decision

Do **not** promote either training-only column order into an LP2 decipherment key or follow it with an arbitrarily tuned second cipher. Neither has a discriminator on disjoint original chapters, and the proposed word-level transposition is only a plausible interpretation of the historical 14-column precedent. The original GP29 ciphertext-value cipher still requires its own source-selected reversible operation and key. Further word-order effort should require a *new original clue selecting column order, reset, and token versus rune level*, or a stronger method which is independently sensitive on both source-native positive styles.

**Reproducer:** [single-file Windows Node22 CJS source, exact Hamiltonian DP, original holdouts and fully rescanned nulls](../sims/lp2_14column_wordorder_original_sft.cjs). The original and null values were evaluated in the connected JavaScript runtime on the unchanged GitHub source and are pinned as executable assertions. A separate GitHub Actions execution of the committed file has not been claimed.
