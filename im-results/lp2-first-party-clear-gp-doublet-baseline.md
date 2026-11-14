# First-party author clear-GP doublet baseline for the original LP2 anomaly

**Agent32, 14 November 2026. Classification: direct source-side discriminator; no plaintext, key or decryption method.**

## The competing explanation

The original unknown LP2 pp0–55 have only **86 equal adjacent rune pairs among 12,901 eligible same-page pairs** (0.6666%). Before treating this as evidence of a ciphertext machine enforcing different successive symbols, compare the source authors' own previously released *clear* GP rune prose. If the writers naturally avoid adjacent identical GP rune symbols, a similarly low rate may appear even without encryption. This comparison is more relevant to that rival than a generic English corpus or a uniformly random baseline.

## Frozen source and results

Select the first-release original transcription `resources/transcriptions/lp1_wulfic_canonical.txt`. Choose six unencrypted source sections by their visibly legible beginnings, such as **SOME WISDOM**, **THE LOSS OF DIVINITY**, **WE HAVE**, **MOST THINGS**, continued clear prose, and **AN INSTRUCTION**. Their exact `%`-delimited source-group indices are **3, 8, 9, 10, 11, 14**. Preserve every internal `&` physical-page delimiter, never treating two physically separated rune glyphs as an adjacent pair. Count all rune adjacencies within each physical page, across printed words just as in LP2.

| Original clear GP source section | GP runes | Same-page eligible pairs | Equal adjacent pairs |
| ---: | ---: | ---: | ---: |
| 3 | 157 | 155 | 7 |
| 8 | 187 | 186 | 7 |
| 9 | 207 | 206 | 5 |
| 10 | 192 | 191 | 3 |
| 11 | 169 | 166 | 3 |
| 14 | 89 | 87 | 3 |
| **Authentic clear GP total** | **1,001** | **991** | **28** |
| **LP2 unknown pp0–55** | **12,956** | **12,901** | **86** |

The clear-author rate is **28/991 = 2.8254%**, against LP2's **86/12,901 = 0.6666%**: a **4.2385-fold rate contrast**. The independent solved original p57 PARABLE has **1/94 = 1.064%**, considerably lower than other selected clear text. Pooling it with the six clear LP1 sections still gives **29/1,085 = 2.6728%**, **4.0095-fold** the LP2 rate.

These numbers are exact descriptive counts of the pinned original rune sequences; adjacent language pairs are correlated, and the clear samples are selected clear LP1 sections, not a randomized sample of all possible creator writing. Do **not** interpret a naive independent-pair binomial or Fisher p-value as a formal calibrated significance test. The contrast is nonetheless a direct first-party counterexample to treating LP2's near-zero adjacent-repeat rate as an ordinary, universal property of the creator's GP spelling habits.

## Cryptanalytic consequence

Original clear manuscript prose has abundant adjacent identical runes, while the long unknown-cipher corpus has far fewer. A proposed decoder should explain why the **encrypted** original has that difference, accounting for word boundaries, physical page geometry, and the variable low-doublet exception rate; this result does not identify which machine generates it. The low-doublet solved p57 sample is a useful caution against claiming every original clear passage must show high doublet frequency.

**Reproduce** directly with [single-file CommonJS original-author comparator](../sims/lp2_original_author_clear_gp_doublet_control_sft.cjs), which asserts all 6 source groups, exact `&` handling, LP2 and independently solved p57 counts. [Successful Windows Node22 manual run 43618046582](https://github.com/FlareZ123/liber-primus/actions/runs/43618046582).
