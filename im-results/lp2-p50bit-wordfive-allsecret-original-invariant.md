# P50 repeat-state plus five-word-phase cannot carry native English under any 290 secret predecessor alphabets

**Agent9, 22 November 2026. Original-cipher, all-secret reversible model exclusion.** This original-source experiment combines the strongest independently documented repeat-associated p50 byte state with the physical p7 five-dot clue. The complete Windows Node22 [SFT](../sims/lp2_p50bit_fivephase_allsecret_majorization_sft.cjs) [passed Actions 44973736935](https://github.com/FlareZ123/liber-primus/actions/runs/44973736935), including an exact independently planted 290-map encrypt/decrypt control. No previously unknown plaintext, original key, cipher opcode or destination was found.

## Why this combined architecture is an actionable decision

The original LP2 p50 numeric table has 256 cells in 32×8 layout. An already published **source-fixed whole-book phase-zero binary state** identifies p50 cells whose first base60 digit is `0` and whose second digit is even under the conventional (contemporaneously participant-attested) base60 alphabet. Exactly 36 of 256 cells qualify. This very state empirically distinguishes adjacent rune repeats in the authentic unresolved ciphertext: **29/1,809** selected transitions against **57/11,092** elsewhere, repeat-rate ratio **3.11957**, while clear-GP controls are neutral ([historical low60/bit0 specificity report](lp2-p50-low60-bit0-clear-controls.md)).

Independently, the original p7 displays five separate black dots immediately below exactly five red rune words. The source's 2,896 actual printed words exhibit an independently measured within-word fifth-back excess. A solver could reasonably try **word-phase mod5**, restarting the clock at authentic printed word boundaries while letting the p50 state provide the changing bit. These clues motivate testing a precise state architecture as a reversible symbol cipher, while none is an authenticated encryption instruction.

**Frozen all-secret model** for every symbol except the completely unconstrained first rune on each of the 55 rune-bearing physical pages:

```
C[pos] = sigma[
  C[pos-1],
  (positionWithinPrintedWord mod 5),
  bit0[(pos-1) mod 256]
][P[pos]]
```

Here `bit0` is exactly the published 36/256 base60 table mask, with one continuous original-book phase-zero clock. Every `sigma` is an **independent, arbitrary, unknown 29-symbol permutation**. There are **29×5×2 = 290 fully secret alphabets**, allowing all `29!` substitutions in each class without a Caesar/Vigenère, linear, DH or textual-key restriction. Original printed words are joined across line and page carries (all **2,896** whole words, **32** real cross-page words). The 55 physical page heads may decrypt to arbitrary symbols. There is no chapter rekeying, page-phase reset or postcipher transposition: those would be a different state source.

For any candidate plaintext set of `k` symbols, each predecessor/phase/bit0 class can map its `k` plaintext symbols to at most the `k` largest observed ciphertext output counts in that class. The exact **all-key** upper bound over the original ciphertext is

```
U(k) = 55 + sum_state sum_largest_k(cipherOutputHistogram[state])
```

Every 29-way secret table, including every actual original encrypted-native-GP example, must satisfy it.

## Original input and finite controls

The source is the **unaltered 12,956 physical LP2 p0–p55 rune tape**, 55 genuine starts and **12,901** internal transitions. Every value in the table below is an **exact, key-independent necessary bound** for that named model; each numerator includes the 55 free page starts.

| All-secret state for 29-way permutation | Maximum any 1 GP plaintext rune | Maximum any 2 | Maximum any 3 | Maximum any 4 |
| --- | ---: | ---: | ---: | ---: |
| Cipher predecessor only, 29 alphabets | **769 / 12,956** (5.9355%) | 1,414 | 2,026 | 2,619 |
| Predecessor + p50 bit0, 58 alphabets | **852** (6.5761%) | 1,570 | 2,243 | 2,875 |
| Predecessor + word phase5, 145 alphabets | **1,081** (8.3436%) | 1,981 | 2,796 | 3,555 |
| Predecessor + both source states, **290 alphabets** | **1,284** (9.9105%) | **2,325** (17.9454%) | **3,247** (25.0617%) | **4,091** (31.5761%) |

The strongest combined architecture still cannot yield more than **9.9105%** of any single plaintext GP symbol, or 31.5761% of any four, no matter what its 290 secret alphabets contain.

Using exactly the source-native English→GP29 spelling authenticated on solved LP1 and LP2 p57 (NG/ING, IA/IO composition), **all 150 original-length control passages** fail the combined four-count bound:

| Source reference | Original-length windows | Minimum top1 / top2 / top3 / top4 GP symbol fractions |
| --- | ---: | --- |
| Gibran | 30 | **11.1377% / 19.8441% / 26.9450% / 33.7295%** |
| Shakespeare | 120 | **10.9447% / 19.0182% / 26.1115% / 32.9345%** |

The 3,510-rune independently solved-reference plaintext also exceeds the combined bound when normalized to its own length. Overlapping 12,956-symbol control windows are calibration observations, not 150 independent hypothesis tests; no claim of a universal natural-language exclusion is made.

The SFT additionally generates **all 290 arbitrary secret 29-way permutations** afresh, actually encrypts a source-native 12,956-rune Gibran passage at exactly the original printed word phases, p50 bit clock and physical-page heads, and recovers its full plaintext using the matching inverse secret permutations, rune for rune. The same source-conditioned majorization upper bound **admits** every encrypted positive, demonstrating the original-English exclusion does not arise from an incorrect cipher implementation.

## Research consequence

The source-visible p50 repeat-enrichment state and p7 five-word rhythm, **even if both directly control independent reversible hidden substitution alphabets, do not supply enough changing state to explain original LP2 as direct GP-native English ciphertext** in the model above. Searching the huge 290-table unknown-key space is therefore unnecessary for this direct source-native family. A genuine decoder must instead specify a different output behavior, additional changing state (such as source-selected chapter/page-specific keys), a post-emission reordering, length-changing/homophonic coding, or a quite different source language/register. Rearranging otherwise native GP plaintext **before** emission leaves its aggregate unigram concentrations unchanged and cannot cure this all-key obstruction.

The exact published low60-bit0 selector is still **only a ciphertext-surface diagnostic**: the original signed Cicada instructions neither authenticate its base60 parity nor specify its use in an encryption equation. Consequently no inference is made that this failed model was used by the creator.

**Reproducibility:** [fixed original-source GP29 corpus](../resources/liber-primus/lp2-corpus.json), [256 original table source](../resources/liber-primus/lp2-grid-256.json), [full original word transcription](../resources/lp2-transcription.txt), [bounded all-secret test](../sims/lp2_p50bit_fivephase_allsecret_majorization_sft.cjs), [Windows Node22 PASS 44973736935](https://github.com/FlareZ123/liber-primus/actions/runs/44973736935).
