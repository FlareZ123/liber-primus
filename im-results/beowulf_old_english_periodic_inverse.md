# Original LP2 versus source-native Old English periodic additive keys

**Agent 33 correction, 11 November 2026, of Agent 7's 10 November 2026 bounded negative.** The original 55 rune-bearing LP2 pages remain encrypted. No unknown plaintext, historical cipher, key or continuation has been recovered.

## Cryptanalytic question

Liber Primus uses an Anglo-Saxon-style 29-symbol GP runic alphabet. One plausible plaintext register is **Old English** rather than the modern English and Latin controls already present in this repository. Its distribution has materially different symbols: in the primary text of the Old English *Beowulf* used here, GP `J` is absent, GP `TH` occurs substantially more often after the *correct* thorn/eth normalization, and GP `EA` appears much more often. This investigation therefore tests whether apparently random LP2 output is a **29-modulus additive ciphertext with an unknown fixed-period key** carrying an Old English plaintext.

The original LP2 source is [the canonical 12,956-GP-symbol corpus](../resources/liber-primus/lp2-corpus.json), retaining all 55 original rune-bearing physical pages. The independent register is the original Old English Harrison/Sharp edition of *Beowulf*, Project Gutenberg eBook 9700 (GITenberg [source mirror](https://github.com/GITenberg/I.-Be-wulf--an-Anglo-Saxon-poem.-II.-The-fight-at-Finnsburh--a-fragment._9700/blob/master/9700-0.txt), pinned source blob `6f6aca13cd499779c2db780ad00f24b3bc2a288f`). The poem is extracted from the `BEÓWULF.` heading to the `APPENDIX` heading, omitting section headings; NFD normalization removes editorial accents, thorn/eth become TH, Æ becomes AE, etc., and the existing GP digraph/singleton conventions are applied greedily. The complete extraction rules appear in the [reproducer](../sims/beowulf_gp_periodic_original_inverse.cjs). The resulting source comprises **10,885 words / 48,012 GP runes**.

The source data fixture [`beowulf_oe_gp_profile_corrected.json`](../resources/control/beowulf_oe_gp_profile_corrected.json) contains the actual histogram from only the **first 16,000** GP runes of the source and a **disjoint** contiguous 12,956-rune positive-control plaintext beginning at source position 16,000, encoded reversibly as a 29-character alphabet. This ensures that the positive controls are genuine Old English text whose runes were never used to fit the source likelihood.

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

The original manuscript's **best of all 20 held-out scores** is **−0.8005301851 nats/rune**, at period **15**, physical-page reset; held-out IoC **0.0345106**, essentially uniform (1/29). All 19 other fitted original candidates are also negative. The next best held-out candidates are period 16 page-reset **−0.8095479** and period 28 continuous **−0.8125563**; the previously reported best period 29 page-reset now gives **−0.8201724**. The corrected source substantially changes fitted keys and scores but leaves all held-out values negative. Training scores improve with larger keys (expected overfitting), but this gain does not generalize to untouched pages.

Three independently generated, exactly reversible plants were constructed from the source-disjoint authentic Old English GP sample on **the same 55 original LP2 page lengths**, encrypted with random GP29 key digits. The fitter was not shown their secret keys or plaintext:

| Planted key | Secret digits recovered | Held-out Old English GP runes recovered | Held-out score |
| --- | ---: | ---: | ---: |
| Period 79, book clock | **79/79** | **6,195/6,195** | **+0.348834** |
| Period 225, page clock | **223/225** | **6,148/6,195** | **+0.344807** |
| Period 225, book clock | **224/225** | **6,167/6,195** | **+0.344581** |

All three plants re-encrypt exactly, rune for rune, under the recovered fitted key and recovered plaintext, and the executable assertions passed.

**Original-input historical CI execution:** [run 42806410289](https://github.com/FlareZ123/liber-primus/actions/runs/42806410289) used the older defective fixture. The corrected program and source are now committed; the new reproducible results above were re-evaluated against the complete corrected source. A new CI run will be linked when executed. [Full deterministic standalone program](../sims/beowulf_gp_periodic_original_inverse.cjs) and [frozen independent source](../resources/control/beowulf_oe_gp_profile_corrected.json) remain in the repository; no external download is needed to rerun the finite inverse.

## Source-control correction that changes the cryptanalytic inference

The original fixture `resources/control/beowulf_oe_gp_profile.json` is **not a correctly mapped Old English register** despite its accompanying NFD/Unicode mapping documentation. Exact reconstruction of its entire 29-entry count vector (45,299 GP runes) requires mapping only **uppercase** `Þ` and `Æ` *before* uppercasing/ASCII stripping; the overwhelmingly more frequent lowercase `þ`, `ð` and `æ` are silently discarded. The old source had **94 TH and 78 AE** in 45,299 runes. Correct Unicode-case-safe normalization of the **same fixed 1,848 verse lines** yields **2,078 TH and 560 AE** in **48,012** runes. Its 10,885 word boundaries remain source-identical. The corrected complete 29-index vector, 10,885 word lengths, 16,000-rune training histogram, and disjoint native source control are frozen in [the corrected fixture](../resources/control/beowulf_oe_gp_profile_corrected.json). The old fixture remains available only for exact historical reproduction; it must no longer be used as a credible Old English language control.

This is a meaningful correction of the *original source register*, rather than a new LP2 plaintext. The same previously declared 20 candidate clocks were re-run with corrected source frequencies. **Every original held-out score remains negative** and the corrected authentic GP plants remain highly recoverable, so the tested family still does not explain the original ciphertext. However any other analysis that reused the old profile needs source-model reassessment before relying on its purported Old English controls.

## Additional source-register observation and limits

The corrected Old English source has **339 GP EA runes in 16,000 training runes (2.11875%)**; the disjoint 12,956-rune planted passage has **262 EA runes**. In all **48,012** corrected GP runes, EA occurs **1,036** times, **140** at word start (13.51%). The original LP2 printed ciphertext has only **86 literal adjacent-equal transitions per 12,901 physical-page-internal transitions (0.66661%)**. A simple claimed *one literal source EA → one same-cipher-glyph marker* zero-step mechanism at this source rate predicts substantially more repeated outputs than observed unless it invokes selective marking or some separate suppressor. Source-frequency differences alone cannot falsify a mechanism with discretionary marking.

The original ciphertext **does not resemble Old English decrypted under any of these 20 fixed-period GP29 additive key schedules**. This is a successful bounded negative with fully solved source-native positive plants. It is not an exclusion of Old English under changing keys, unknown phase skips, transposition, keyed substitutions, state-dependent alphabets or more general layered cryptography. The original unknown plaintext need not match the source's rune frequencies. The shared objective therefore remains open; this rules out a narrow but independently motivated direct inverse and makes renewed unstructured period tuning under the same family low priority.
