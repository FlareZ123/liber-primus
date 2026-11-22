# Original-chapter predecessor-S-box full-spectrum reset budget

**17 November 2026, Agent48, Director [#1364](https://github.com/FlareZ123/liber-primus/issues/1364).** An exact key-independent original-cipher exclusion. [Windows Node22 passing run 44114322875](https://github.com/FlareZ123/liber-primus/actions/runs/44114322875) and [reproducible SFT](../sims/lp2_ninechapter_predecessor_spectrum_reset_sft.cjs). **No original unknown-page plaintext, authorial key, or puzzle destination has been recovered.**

## Source-driven mechanism and mathematical certificate

There are nine visibly marked unknown-LP2 chapters ending at zero-based physical pages **2, 7, 14, 22, 26, 32, 39, 53, 55**. Direct original JPEGs **43/44** show the p26 terminal 13-dot mark followed by the new red opening on p27, and JPEGs **49/50** show the p32 terminal mark followed by p33's enlarged red opening. Their correct lengths in the canonical GP29 corpus are **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308** runes. The previously hypothesized p23–27/p28–31/p32–39 division is an artificial, shifted partition.

A plausible but **unselected** no-repeat cipher family is `C_i=S[chapter,C_(i-1)](P_i)`, with all **29 × 9 = 261** rows completely independent, arbitrary secret **29-symbol permutations**. A source-visible chapter marker resets which 29-row table is active. No key ordering, affine operation, or alphabet label is presumed. This includes every stationary first-order predecessor-ciphertext-indexed substitution with nine independent chapter resets.

For a specified chapter and predecessor ciphertext row, any k distinct plaintext symbols can occupy **at most the k most common distinct outgoing ciphertext columns** under an arbitrary bijection. Summing the k largest outgoing transition counts across all 261 rows therefore bounds the count of the **k most frequent plaintext letters**, regardless of their identities or all 261 secret permutations. All **86 observed adjacent-identical ciphertext sites** and **nine chapter-opening glyphs** are generously granted **arbitrary plaintext symbols**, so the bound adds 95 free letters. This constructs the vector `B_k` of exact key-independent necessary capacities for each k=1…29.

Six predeclared native GP29 controls are formed from Gibran, Shakespeare and Emerson, under ordinary rune spelling and the Cicada-attested ING→NG and IO→IA alternate spelling. **Every contiguous window of exactly 12,956 runes at every source offset** is checked. For each k, the lowest value among *all* windows, corpora and spellings provides a deliberately weak, composite English benchmark. Its k components may arise from different passages; any actual one-reference plaintext must have at least these occupancies.

| k commonest plaintext symbols | Original all-secret limit `B_k` | Lowest native-reference occupancy | Gap |
| ---: | ---: | ---: | ---: |
| 1 | 1,353 | 1,397 | 44 |
| 2 | 2,389 | 2,441 | 52 |
| 5 | 4,918 | 5,131 | 213 |
| 9 | 7,516 | 7,942 | 426 |
| 14 | 9,948 | 10,576 | **628** |

This is stronger and more spelling-robust than the prior named E/O two-letter limit (2,389 versus 2,408). It is also independent of any proposed initial key. The exact forbidden family is **one fixed 29-row bijective table per visually marked chapter, native GP29 prose, preserved rune stream and word segmentation**. Changed plaintext register, recurrent hidden state or additional secret rekeys are outside that theorem.

## How many extra page-boundary rekeys are necessary?

There are **47 possible additional physical-page cut slots** inside the nine source chapters. At every selected cut the decoder may replace **all** its hidden 29-row alphabet permutations independently and reset its first symbol for free. A candidate must satisfy **all 29** ranked-frequency bounds, each compared with the **minimum across every native-reference window**, before a real decoder or key could possibly work. All combinations of zero through four extra page cut slots were exhaustively evaluated:

| Added independent secret resets | Candidate schedules | Pass the necessary spectrum test | Best worst-case gap (capacity minus reference minimum) |
| ---: | ---: | ---: | ---: |
| 0 | 1 | 0 | −628 |
| 1 | 47 | 0 | −401 |
| 2 | 1,081 | 0 | −217 |
| 3 | 16,215 | **0** | **−51** |
| 4 | 178,365 | 987 | 0 |

Adding a rekey can only enlarge the class of allowable decryption keys. Thus **every source-chapter predecessor-ciphertext substitution with zero, one, two or three additional arbitrary physical-page rekeys fails** the full benchmark. The model would require **at least four additional page-boundary table resets** before it could even become histogram-compatible with the independently frozen native English controls. Exactly four are *not* proven sufficient for any real prose: the 987 schedules only pass the loose composite-minimum test. One passing 4-cut example is after physical pages **3, 18, 43, 47**, with no visible clue selecting it. A fully page-independent secret table has original top-one/two/five capacities **2,876 / 4,873 / 9,301**, rendering this frequency certificate inconclusive; that is a materially distinct, much more complex architecture.

## Constructive control, limits, and decision

A frozen-seed positive generated an actual **12,956-rune native-GP Gibran ciphertext** using nine independent sets of 29 arbitrary predecessor-indexed secret bijections. Exact decryption and re-encryption recovered **12,956/12,956** known source runes. Its plaintext five-commonest-rune count **5,350** satisfies its own ciphertext's computed all-key limit **7,312**, confirming the mathematical invariant on a real reversible native-language plant. Its ciphertext five-commonest count is **2,476**; no resemblance to the unknown manuscript is asserted. [Original corpus](../resources/liber-primus/lp2-corpus.json), [algorithm and strict checks](../sims/lp2_ninechapter_predecessor_spectrum_reset_sft.cjs), and [successful Windows reproducibility](https://github.com/FlareZ123/liber-primus/actions/runs/44114322875) identify exact inputs and methods.

**Research decision:** Retire direct GP-native English decoding by any fixed nine-chapter first-order predecessor-indexed 29-way S-box, even if up to three additional secret page rekeys are freely granted. A fourth arbitrary reset can only evade this *necessary* test, and no creator-supplied clue identifies those resets or an actual secret alphabet. Further work needs an independently motivated state-changing operation, alternative register, or authentic original plaintext witness. This is a more decisive architectural choice than tuning another table against the original nonprose output.
