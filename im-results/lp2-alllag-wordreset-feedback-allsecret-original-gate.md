# Any positive word-reset additive ciphertext-feedback lag: all-key original exclusion

**Agent28, 22 November 2026. Classification: exact original-input necessary-condition theorem, GP-native-English reference rejection, and reversible full-word positive controls.** No unknown LP2 plaintext, creator-selected key, complete cipher, or final destination recovered. This decision generalizes the **previously investigated five-back** per-word map to **every positive feedback lag**, including both shorter and longer clocks, and tests the whole transformed-word same-symbol structure without choosing any of the 2,896 secret alphabets.

## First-party source and architecture

The canonical 2014 unknown LP2 pp0–55 have **12,956 GP29 runes** and **2,896 complete printed words**. The longest printed complete word is **14 runes**; 83 are single-rune, 448 double-rune, and 32 physically cross page boundaries. Reconstruct true complete words by joining original page/line wraps; physical rune-free p50 is not a delimiter. The script asserts exact 12,956-rune index equality against the independent canonical integer corpus.

The repeated source five-dot motif and fifth-distance echoes provide an original-visible reason to test ciphertext feedback within words, but do not select the exact operation or secret keys. This hypothesis grants an **arbitrary fresh GP29 permutation for every original complete word**, with unlimited independent hidden key entropy and a freely evolving source-secret state selecting those maps. For any fixed *positive integer lag* l, model:

\[
Q_{w,j}=\pi_w(P_{w,j}),\quad
C_{w,j}=(Q_{w,j}+[j\ge l]C_{w,j-l})\bmod29.
\]

The first l positions of each printed word thus provide initial ciphertext without a separate nonce. The same complete word may continue across physical pages with no state reset at the page margin. The entirely ciphertext-derived inverse residual is

\[
D_{w,j}=(C_{w,j}-[j\ge l]C_{w,j-l})\bmod29=\pi_w(P_{w,j}).
\]

Because each secret permutation is a bijection shared *within* one complete word, it preserves the number of unordered equal-letter pairs E_w = sum over rune identities r of choose(count_w(r),2). **For every secret key schedule and every fresh 29! word map, E(D_l) = E(P) exactly**. A lossy but single-valued map can only *raise* the residual's equal-pair count. Thus, for any ordinary GP-native English plaintext whose word lengths/word boundaries are preserved, the source's exact E(D_l) must match or exceed the plaintext donor's corresponding internal-pair count. Unlike searching another key, this is a key-free universal necessary condition for the whole stated model.

This is distinct from the earlier exact lag-five complete-word gate, from the one-back shared-page/phase alphabets and from the raw one-alphabet-per-word equality theorem: **the feedback is inverted on the actual original ciphertext for every lag**, before assessing secret symbol-map invariants.

## All positive lags exhausted from the original word-length maximum

Since the longest genuine printed word has 14 runes, **every lag at least 14 performs no within-word feedback**. Its entire inverse residual is just the unchanged original cipher word, with E=811. Hence it suffices to compute original residuals for lags **1 through 13**. Their exact unmodified original all-word internal repeat counts are:

| Positive ciphertext-feedback lag | E of original inverse residual |
| ---: | ---: |
| 1 | **1,079** |
| 2 | 1,026 |
| 3 | 939 |
| 4 | 863 |
| 5 | 817 |
| 6 | 803 |
| 7 | 842 |
| 8 | 817 |
| 9 | 816 |
| 10 | 811 |
| 11 | 810 |
| 12 | 811 |
| 13 | 812 |
| **Every lag 14 or greater** | **811**, no feedback anywhere |

**The maximum across ALL positive lags is 1,079**, at lag1. The source p7 five-step motif's lag5 yields only 817. All numbers use **every one** of the actual 2,896 complete original word shapes and 12,956 original runes; no text is deleted or reclassified.

## Frozen source-native GP-English controls and genuine recovered positive

The original length pattern is held exact and used to draw **1,000** independent seeded complete word books from each of archived Shakespeare, Emerson and Gibran, using solved-LP1 calibrated GP29 orthography (including ING→NG and IO→IA contractions). Shakespeare and Emerson each provide donor words for **all 2,896** source word lengths. Gibran lacks GP length14 and supplies **2,893** comparable positions; those three omitted words are excluded only on its side, a **conservative comparison** because the maximum full-original transformed count1,079 is at least as large as the corresponding restricted count.

| Native GP-English source | Exact comparable original slots | Lowest donor internal equal-pair count in 1,000 draws | Highest donor count | Draws at or below the strongest original residual 1,079 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 2,896 | **1,182** | 1,418 | **0 / 1,000** |
| Emerson | 2,896 | **1,184** | 1,393 | **0 / 1,000** |
| Gibran | 2,893 | **1,180** | 1,430 | **0 / 1,000** |

Even the *most* concentrated original one-back inverse is **at least 101** internal equal pairs below every one of these 3,000 full-shape native-GP controls. These donor samples are resampled, correlated English literature and cannot exclude every possible engineered or ancient text; they are a strict finite necessary-condition test under this **explicitly conditioned** language family and source word segmentation.

Each of the 13 independently executable lags also has a **real positive full 12,956-rune GP-native English plant**, in which every original-length donor word receives an **independent actual random 29! GP29 permutation** before ciphertext-feedback encryption. Every model exactly inverts all planted ciphertext words, verifies the full transformed-word equality theorem and reencrypts the recovered text. An additional **independent genuine solved Cicada p57 GP-native 95-rune, 20-word positive plant** decrypts and forward-replays exactly for every lag1–13. These genuine inverse positives are necessary implementation checks and do not authenticate the historical key.

## Decision and missing typed operation

**Exclude the entire direct native-GP-English word-reset additive ciphertext-feedback architecture with one arbitrary, fresh, even cryptographically state-derived GP29 rune substitution alphabet per complete original printed word for EVERY possible positive integer lag.** A source-selected five-lag choice does not rescue the class. Adding a longer clock, increasing the secret entropy, choosing a new per-word alphabet, or changing per-word initial keys cannot change the key-independent original residual multiplicities.

The remaining unexplained operand is a **source-selected output/state equation genuinely varying within each printed word**, e.g. more than one alphabet per word, a nonlinear vector operation, a controlled reinterpretation of apparent word separators, one-to-many/homophonic encoding, or a different underlying plaintext language/register. The visible source does not license one; a successful follow-up requires an original unmodified long continuous native GP plaintext paragraph and independent heldout recovery. Nothing here supplies unknown original plaintext.

**Reproduce:** [standalone Windows 11 Node.js22 CommonJS SFT](../sims/lp2_alllag_wordreset_allsecret_feedback_original_sft.cjs), assertions on all source runes and printed word boundaries, exact 13 residuals and all lags≥14, frozen donor RNG and GP orthography, and actual 13×2 matched-original-shaped/solved-Cicada positive encrypt/decrypt cycles. **Original-source Windows PASS** at [GitHub Actions run 45021658331](https://github.com/FlareZ123/liber-primus/actions/runs/45021658331).
