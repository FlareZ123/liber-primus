# Duplicated p53/p55 moth: all-reserved GP28 predecessor-key reuse is incompatible with native-word originals

**Agent28, 14 November 2026. Original-input bounded cryptanalytic decision; no recovered unknown plaintext or historical key.**

## Source-selected question and independent objection

The **same moth drawing** appears almost pixel-identically on original LP2 physical p53 (`70.jpg`) and p55 (`72.jpg`) after translation. This independently visible duplication motivates asking whether the maker reused a page-local secret over their passages. The unknown manuscript has **86 adjacent equal GP runes among 12,901 within-page opportunities**, far below ordinary random GP29 expectations. These two concrete observations nominate a **reversible, predecessor-excluding 28-step output alphabet** with a deliberately rare exception symbol, distinct from the earlier ordinary GP29 two-time-pad attack. They do **not** establish that the author chose either mechanism or reused the key.

The original p53 contains 179 runes in 40 printed words; the original p55 has 76 rune glyphs, of which its initial NG completes a word from p54. Its own 75-rune body comprises 16 complete words of length `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Freeze **p53 positions 0–74** against **p55 physical positions 1–75**. Allow arbitrary, independently chosen page initialization, so no artificial equality of the first plaintext rune is imposed.

## Frozen lossless 28-rank model

Choose a reserved source plaintext rune `R ∈ {0,…,28}` and a shared arbitrary secret `K[i] ∈ {0,…,27}`, in GP29 ordinal order. Remove R from the GP inventory and let `rank_R(P)` be the index 0–27 of any other plaintext rune. For every position after its independently initialized page state, encode:

```
if P[i] == R:
    C[i] = C[i-1]
else:
    C[i] = (C[i-1] + 1 + ((rank_R(P[i]) + K[i]) mod 28)) mod 29
```

With K known this is **exactly reversible for all 29 runes**: difference `(C[i]−C[i−1]) mod29 = 0` identifies R, while a nonzero difference identifies the unique `(delta−1−K[i]) mod28` rank. It has no silently discarded symbols. The reserved symbol is allowed to be **any of the 29**, rather than postselecting a convenient rare English rune. Its output has the observed qualitative anti-repeat possibility (rare R maps to a doublet), while all other inputs necessarily avoid the previous ciphertext glyph.

For two pages whose nonexception key clocks are aligned, whenever **both** ciphertext predecessor differences are nonzero, their unknown `K[i]` cancels exactly:

```
rank_R(P53[i]) - rank_R(P55[i])
   == (C53[i]-C53[i-1]) - (C55[i]-C55[i-1])  (mod 28)
```

The only original immediate repeated ciphertext glyph in these first 75 positions is **p55 body offset58** (zero-based); p53 has none. Therefore the two-key-clock equality and this invariant are unaffected by a hypothetical transparent-R key skip **through the first 58 positions**. The decisive failure occurs much earlier; no unknown skip convention after offset58 can repair it.

## Exact key-blind original experiment

Construct a trie from **29,060 distinct source-native GP word forms** drawn from pinned TextBlob/Norvig `resources/control/english_wordfreq_textblob.txt`, applying the authenticated ING→single rune and IO→single rune spellings and established Latin-letter folds. Preserve the exact two original printed word-length sequences, including the p53 word extending beyond the aligned 75 positions. An exact product-trie dynamic program advances both candidate plaintext streams simultaneously, at every position granting **every valid next dictionary rune pair** consistent with the 28-rank cancellation identity. A separate secret `K[i]` may take any of the 28 values at every index. There is no guessed key, fitted language score, candidate phase or tuned plaintext.

**Original outcomes, all 29 reserved-rune choices:**

| First impossible rune (1-based, in the 75-rune alignment) | Number of reserved choices |
| --- | ---: |
| **13** | **24** |
| **14** | **5** |
| Reaches rune 15 or later | **0** |

The original paired ciphertext becomes incompatible with *any* corresponding pair of full source-native English dictionary words before its first repeated output and before the 15th symbol, for every R. The largest live intermediate product-trie state count is 2,425, so this is an exhaustive finite-state conclusion, not beam-search pruning.

### Six-rune local certificate, independent of the longer word stream

The first obstruction can be isolated to just two visibly printed words. Original p53's **third word** is seven runes long and occupies local positions **8–14**. Original p55's **fourth complete body word** is six runes long and occupies body positions **8–13**. Their first six positions coincide under the frozen page-start alignment; neither original ciphertext has a repeated rune within these six predecessor transitions. The exact, source-only vector is computed by first reducing **each** cyclic ciphertext difference modulo 29, then subtracting the two resulting differences modulo 28. This ordering matters: applying modulo 28 directly to raw rune-index differences would incorrectly replace the first coordinate **4** by **5**. The six resulting values are:

```
[4, 27, 25, 19, 15, 24]
```

The pinned TextBlob lexicon supplies **4,776 distinct native-GP seven-rune words** and **4,657 distinct native-GP six-rune words**. Hash-index every complete six-rune dictionary word by its compressed GP28 rank sequence; for each possible seven-rune word ask if its first six rune ranks differ by precisely the six original values. Repeat for every R, discarding candidate words containing that R at positions where both original ciphertext deltas are nonzero. **Result: zero matched dictionary-word pairs for all 29 reserved runes.** This gives a small, independently intelligible cryptanalytic incompatibility, without needing the remainder of the 75-rune dynamic program.

If the first overlapping coordinate at the newly printed word boundary is deliberately omitted, the five-step window still has no dictionary match for **25** of 29 reserved runes; R indices 19–22 retain three possible seven-rune words each. Thus the six-step impossibility requires the stated **page-continuous predecessor update**, rather than assuming an independently reset state at every printed word. The model's word-boundary convention and key reuse are unverified creator hypotheses.

**Three independent secret-key positive plants** (R = GP indices 0, 17, 28) encode separate native dictionary passages with all 179 p53 and 75 p55 runes under the exact same unknown rank28 key at aligned positions and independent page IVs. All three recover the exact original native plaintext under the known true key and re-encrypt it verbatim. The same **key-blind** product trie reaches all 75 positions for every plant, with 20/21/21 final compatible state pairs. This confirms the original rejection is not caused by a broken inverse, misread word boundaries or a solver unable to detect true shared-key examples.

[Complete Windows-compatible CommonJS SFT](../sims/lp2_p53_p55_rank28_sharedpad_source_sft.cjs), with [successful manual Windows/Node22 GitHub Actions run 43584021778](https://github.com/FlareZ123/liber-primus/actions/runs/43584021778). The program asserts the exact source runes, 75-body correction, native word lengths, 29/29 original exclusions and three complete reversible plants.

## Decision

This evidence **rejects a specifically stated, source-motivated shared-key 28-rank predecessor-difference mechanism** for normal native-GP English passages with unchanged original word boundaries and the frozen page-origin alignment. That is stronger than rejecting a small list of guessed keys; all their values cancel. It does **not** identify the actual cipher, rule out a different language or hidden plaintext segmentation, test arbitrary page-to-page pad offsets, or reject independently keyed pages, changing 28-symbol alphabets or nonrepetition introduced as a probabilistic postprocessor.

The duplicated moth alone provides no key reuse instruction, and no first-party clue selects a reserved rune or this exact cipher grammar. Without such an independent source instruction, do not launch another pad-phase, R-bypass-clock or dictionary-wordlist rescue of the failed early original prefix. The next meaningful fork is an authenticated key/original operation that yields **actual unknown plaintext**; inspect the already established [ordinary GF29 moth two-time-pad test](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md) and the [broader inversion frontier](../workplace/integrated-original-inversion-challenge.md) before returning to this art-linked pair.
