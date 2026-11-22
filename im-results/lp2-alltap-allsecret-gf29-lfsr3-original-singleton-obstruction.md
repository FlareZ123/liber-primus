# GP29 third-order LFSR: exhaustive original-singleton obstruction

**18 November 2026, Agent45. Evidence status: original-source exhaustive negative, scope limited to one full cipher family.** The continuous additive GP29 LFSR keystream of order three or below cannot produce English A/I/O at the first thirteen original printed singleton words, for **any** recurrence coefficients or arbitrary three-symbol initial key. This does not recover unknown Liber Primus plaintext, a creator key, or the final destination.

## Causal hypothesis and original input

Wulfic's external [13 November 2026 backlog, proposed stage AL](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/TODO.md) identifies third-order GF29 recurrences as a potential independent running key but describes the correctly aligned original-input trial as unrun. The current repository has tested particular higher-order/grid-derived recurrence factors, not this complete all-tap, all-seed original singleton gate. A short linear recurrence could have been built with 2014-era arithmetic, though there is **no printed Cicada instruction selecting an LFSR**.

Let GP29 original plaintext and ciphertext symbols be \(P_i,C_i\in\mathbb F_{29}\). Grant every possible \(a,b,c,K_0,K_1,K_2\in\mathbb F_{29}\), and define

\[
K_i=aK_{i-1}+bK_{i-2}+cK_{i-3}\pmod{29}\;(i\ge3),
\quad C_i=P_i+K_i\pmod{29}.
\]

The key advances once for each printed rune, continuously across all physical pages. There are no skips, resets, erasures, extra stages or changed word boundaries in **this** explicitly testable model.

The authoritative source GP29 page corpus and independent original rune transcription agree on **12,956** unsolved p0–55 runes, **2,896** whole printed words, **83** one-rune words and **32** words continuing across physical page boundaries. Generously permit any native English single-rune word to be A/I/O, GP indices **[24,10,3]**. The first thirteen immutable source observations, with zero-based global rune offsets and GP indices, are:

| Original rune offset | Original ciphertext index |
|---:|---:|
| 176 | 28 |
| 244 | 15 |
| 350 | 9 |
| 530 | 1 |
| 644 | 0 |
| 792 | 21 |
| 967 | 8 |
| 1025 | 7 |
| 1062 | 2 |
| 1250 | 27 |
| 1316 | 26 |
| 1545 | 19 |
| 1814 | 8 |

## Algebraic enumeration of every unknown key

For each of all **29³ = 24,389** tap triples, propagate the three GF29 basis initial states into the 13 original singleton positions. This expresses every target key symbol as a 3-component linear row in the **three completely secret** initial key values. Select maximally independent anchor rows of rank \(r\); enumerate all \(3^r\) possible A/I/O anchor-plaintext assignments and **all \(29^{3-r}\) free coordinates**. Solve the exact invertible GF29 pivot minor. The construction accounts for every possible compatible unknown three-symbol seed, including singular/degenerate lower-order tap families. Every resulting candidate is tested against the thirteen independently observed source singleton glyphs.

| Singleton-row rank | Tap vectors | Source-compatible secret seeds tested |
|---:|---:|---:|
| 0 | 1 | 24,389 |
| 1 | 28 | 70,644 |
| 2 | 812 | 211,932 |
| 3 | 23,548 | 635,796 |
| **Total** | **24,389** | **942,761** |

All 942,761 keys are enumerated, with exact longest-leading-A/I/O-prefix histogram:

| Leading original singletons passing | Candidate keys |
|---:|---:|
| 0 | 24,389 |
| 1 | 73,902 |
| 2 | 214,224 |
| 3 | 565,630 |
| 4 | 58,106 |
| 5 | 5,662 |
| 6 | 721 |
| 7 | 120 |
| 8 | 7 |
| **9–13** | **0** |

A maximizer is taps **[4,4,1]**, initial key **[25,13,0]**, with only **eight** consecutive original singleton constraints satisfied. These parameters are a chance-fit partial lead and **not genuine key material**. The empty ninth-singleton extension excludes this complete source-to-plaintext model regardless of all 70 later singleton constraints.

## Positive controls and reproducibility

Read-only [Windows Node22 CommonJS original-source test](../sims/lp2_lfsr3_alltap_allseed_singleton_source_sft.cjs) pins both source inputs, the exact 13 sites, all 24,389 tap families, every algebraic rank class and the full outcome histogram. The independent original-shape positive controls tile the authentic **95-rune clear p57** plaintext to a full **12,956-rune** input, replace all 83 source singleton slots with known A/I/O, then encrypt using hidden true seeds in **rank-three** and **rank-two** LFSR cases. The correct seeds survive their complete original-layout singleton tests, and **12,956/12,956 plaintext symbols decrypt and re-encrypt exactly** in both positive controls. GitHub Actions [Windows Node22 PASS, run 44372415142](https://github.com/FlareZ123/liber-primus/actions/runs/44372415142) independently executed every test against repository source files.

**Interpretation:** Exclude continuous, unskipped additive GP29 LFSR keystreams of order ≤3 when native English one-symbol words preserve printed boundaries. The result does **not** exclude the solved p56's plaintext-F skip transferred to a different key stream, nonlinear output maps, drifting/re-keyed recurrences, other alphabets, high-order registers, or hidden multiple stages. Any such successor requires an independent source-visible reason and an intact original-cipher inverse. This negative is intermediate evidence and does not change the authoritative overall outcome: no authentic unknown-page plaintext has been recovered.
