# Original LP2 versus source-native Old English periodic additive keys

**Agent 7, 10 November 2026. Status: bounded cryptanalytic negative.** The original 55 rune-bearing LP2 pages remain encrypted. No unknown plaintext, historical cipher, key or continuation has been recovered.

## Cryptanalytic question

Liber Primus uses an Anglo-Saxon-style 29-symbol GP runic alphabet. One plausible plaintext register is **Old English** rather than the modern English and Latin controls already present in this repository. Its distribution has materially different symbols: in the primary text of the Old English *Beowulf* used here, GP `J` is absent, GP `TH` is rarer after the editorial thorn/eth normalization, and GP `EA` appears much more often. This investigation therefore tests whether apparently random LP2 output is a **29-modulus additive ciphertext with an unknown fixed-period key** carrying an Old English plaintext.

The original LP2 source is [the canonical 12,956-GP-symbol corpus](../resources/liber-primus/lp2-corpus.json), retaining all 55 original rune-bearing physical pages. The independent register is the original Old English Harrison/Sharp edition of *Beowulf*, Project Gutenberg eBook 9700 (GITenberg [source mirror](https://github.com/GITenberg/I.-Be-wulf--an-Anglo-Saxon-poem.-II.-The-fight-at-Finnsburh--a-fragment._9700/blob/master/9700-0.txt), pinned source blob `6f6aca13cd499779c2db780ad00f24b3bc2a288f`). The poem is extracted from the `BEÓWULF.` heading to the `APPENDIX` heading, omitting section headings; NFD normalization removes editorial accents, thorn/eth become TH, Æ becomes AE, etc., and the existing GP digraph/singleton conventions are applied greedily. The complete extraction rules appear in the [reproducer](../sims/beowulf_gp_periodic_original_inverse.cjs). The resulting source comprises **10,885 words / 45,299 GP runes**.

The source data fixture [`beowulf_oe_gp_profile.json`](../resources/control/beowulf_oe_gp_profile.json) contains the actual histogram from only the **first 16,000** GP runes of the source and a **disjoint** contiguous 12,956-rune positive-control plaintext beginning at source position 16,000, encoded reversibly as a 29-character alphabet. This ensures that the positive controls are genuine Old English text whose runes were never used to fit the source likelihood.

## Fully specified inverse

For any phase `j` under a known candidate period `L`, fit a completely arbitrary additive key rune `K_j` from the first **28** rune-bearing LP2 pages (6,761 original source runes), without viewing any plaintext on the remaining **27** pages (6,195 runes):

```text
C_i = (P_i + K_(clock(i) mod L)) mod 29
K_j = argmax(k=0..28) sum_(training positions i with clock(i) mod L = j)
       log((source_count[(C_i-k) mod29]+0.5) / (16000+14.5))
```

`clock` is either book-continuous from original page 0 or reset to zero at every original rune-bearing physical page. The period set is `{15,16,28,29,32,41,79,164,225,256}` (10 values × 2 clocks = **20 fully fitted models**). The 29 possible key values for each phase are optimized exhaustively, so the test does not miss a better key because of local search.

After training, freeze every phase and report the held-out per-rune log-likelihood **excess over a uniform 29-rune register**. A value above zero would support Old English-like plaintext relative to uniform under this exact model; negative results do not prove a different cipher's impossibility. Report held-out IoC as a secondary check.

## Executed original results and positive controls

The original manuscript's **best of all 20 held-out scores** is **−0.7882295543 nats/rune**, at period **29**, physical-page reset; held-out IoC **0.0344756**, essentially uniform (1/29). All 19 other fitted original candidates are also negative. For context, period 79 continuous gives held-out approximately −0.808, period 225 page-reset −0.811, and period 225 book-continuous −0.824. Training scores improve with larger keys (expected overfitting), but this gain does not generalize to untouched pages.

Three independently generated, exactly reversible plants were constructed from the source-disjoint authentic Old English GP sample on **the same 55 original LP2 page lengths**, encrypted with random GP29 key digits. The fitter was not shown their secret keys or plaintext:

| Planted key | Secret digits recovered | Held-out Old English GP runes recovered | Held-out score |
| --- | ---: | ---: | ---: |
| Period 79, book clock | **79/79** | **6,195/6,195** | **+0.39800** |
| Period 225, page clock | **221/225** | **6,105/6,195** | **+0.38674** |
| Period 225, book clock | **223/225** | **6,140/6,195** | **+0.39233** |

All three plants re-encrypt exactly, rune for rune, under the recovered fitted key and recovered plaintext, and the executable assertions passed.

**Original-input CI execution:** [Actions run 42806410289](https://github.com/FlareZ123/liber-primus/actions/runs/42806410289) completed successfully using Node 22. [Full deterministic standalone program](../sims/beowulf_gp_periodic_original_inverse.cjs) and [frozen independent source](../resources/control/beowulf_oe_gp_profile.json) remain in the repository; no external download is needed to rerun the finite inverse.

## Additional source-register observation and limits

The frozen Old English source has **363 GP EA runes per 16,000 runes (2.26875%)**; the separate planted passage has **289 EA runes per 12,956 runes (2.23063%)**. The original LP2 printed ciphertext has only **86 literal adjacent-equal transitions per 12,901 physical-page-internal transitions (0.66661%)**. A simple claimed *one literal source EA → one same-cipher-glyph marker* zero-step mechanism at this source rate predicts substantially more repeated outputs than observed unless it invokes selective marking or some separate suppressor. Source-frequency differences alone cannot falsify a mechanism with discretionary marking.

The original ciphertext **does not resemble Old English decrypted under any of these 20 fixed-period GP29 additive key schedules**. This is a successful bounded negative with fully solved source-native positive plants. It is not an exclusion of Old English under changing keys, unknown phase skips, transposition, keyed substitutions, state-dependent alphabets or more general layered cryptography. The original unknown plaintext need not match the source's rune frequencies. The shared objective therefore remains open; this rules out a narrow but independently motivated direct inverse and makes renewed unstructured period tuning under the same family low priority.
