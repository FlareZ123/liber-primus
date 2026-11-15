# P40 red-eight columns: all 232 previous-ciphertext state alphabets fail the authentic 3,000-rune GP register

**Agent48, 15 November 2026. Classification: original-input, secret-key-independent necessary-condition rejection of one changing-key cipher architecture. No unknown Liber Primus plaintext, authentic key, source-selected cipher operation or destination was recovered.** The finding separates a genuinely state-dependent, enormous unknown-key family from the already rejected static 256-cell table cycle.

## What an original solver can see, and what remains conjectural

- The original LP2 p40–53 printed section contains **3,008** GP29 ciphertext runes. Its first **eight red runes** have original indices `[0,9,19,26,6,23,25,8]`; sorting them as column labels gives the definite order `[0,4,7,1,2,5,6,3]`.
- The remaining **3,000** runes permit a precise eight-column classical inverse: eight consecutive 375-rune ciphertext blocks, placed into the source-rune-sorted columns and read row-major.
- The same physical section prints a 32×8 table across pp49–51. The **29** GP alphabet symbols fit in 32 printed row positions, leaving three spare rows. A simple ciphertext-feedback reading would select table row `C[i−1]` and column `i mod 8`. The final red-heading rune, index8, is a plausible initial state.

These facts motivate a bounded causal decoder, but **no signed 2014 text or decoded LP2 instruction says to select the table row from the previous ciphertext rune, to discard the three extra rows, or to make each cell a 29-way alphabet**. The following gate intentionally grants every one of its keys as secret to determine whether this architecture could even carry ordinary GP-native prose. The actual 256 printed table values are no longer required after freezing the row and column semantics.

The older [p40 all-secret fixed-256-cell test](lp2-p40-grid256-allsecret-phase-equality.md) uses static phase `(row mod32, col)`. Here the key state instead changes with the actual preceding **ciphertext rune**, and it is selected causally by the transmitted data. The families are not nested and have different necessary-condition counts.

## Fully specified and reversible family

Let `C[0..2999]` be the eight-column inverse of the original source's exact p40–53 post-heading ciphertext. Define its state on each position by

`s_i = 29 (i mod8) + C_(i−1)`, where `C_(−1)=8`.

For each of the **232** possible states, grant one **arbitrary independent permutation** `π_s` of all 29 GP runes, unknown and unconstrained by the original numeric table. The candidate encoding and decoding rules are

`C_i=π_(s_i)(P_i)`,  `P_i=π_(s_i)^(−1)(C_i)`.

The original ciphertext determines the state at every position before an unknown key is recovered. Any such family is lossless and self-synchronizing after the first rune; the reconstruction is causal when the inverse 8-column classical rearrangement is treated as a prior stage. The cipher admits `(29!)^232` possible independent secret permutation assignments. Key choice cannot affect the following theorem.

For every pair of positions `i<j` with identical observed state `s_i=s_j`, bijectivity forces

`C_i=C_j ⇔ P_i=P_j`.

Thus the total within-state same-symbol pair count is exactly fixed **for all keys**. An output score or successful wrong-key reencryption cannot rescue a mismatch with source-native plaintext collision structure. This invariant is insensitive to which 29-byte row-to-symbol key is chosen, additive versus nonadditive substitution, or any permutation of the eight complete columns.

## Unmodified original and separately generated native-GP controls

The original source has all **232** state groups populated, of sizes 4–23, and the exact within-state collision count is:

| Source / control | Eligible within-state unordered pairs | Equal-rune pairs | Equal-pair rate |
| --- | ---: | ---: | ---: |
| **Original p40–53, after red-key inverse** | **19,213** | **663** | **0.034507885286** |
| 350 independent synthetic *ciphertexts* of genuine GP-normalized Shakespeare/Gibran 3,000-rune windows, using 232 independent secret additive shifts and feedback on emitted `C` | Variable per window | Variable | **minimum 0.058282209**, median 0.064946708 |
| Same 350 actual English windows, evaluated against the **original's fixed source state tape** (a different conditional calibration) | Fixed 19,213 per window | Variable | **minimum 0.055014834**, median 0.060688076 |

For both prespecified control modes, **0/350** windows score at or below the original's exact rate. The random-shift controls have 5th percentile **0.060308973** and maximum **0.083288528**; the source-state controls have 5th percentile **0.057096757** and maximum **0.066881798**. Sampling windows and keys used a reproducible seeded LCG `0x3301d1f4` over the unchanged repository Gibran and Shakespeare controls. These are finite, overlapping authentic-text windows and a conditional English calibration, not 350 independent historical texts or a probability of Cicada's intended mechanism.

Critically, for **each of the 350 encrypted controls**, the test computes state from the **new ciphertext**, checks the 232-group equality invariant against the **original supplied plaintext**, and asserts exact equality. The stronger positive test uses 232 **completely arbitrary independently shuffled 29-way permutations**, encrypting a separate authentic Gibran 3,000-rune window causally and recovering **3,000/3,000** plaintext rune values by exact inverse. Its state-group pair invariant holds as well. This is a cipher-correctness and native-plaintext positive control; it does not identify the historical key.

An additional literal source-byte consumer was inspected before the stronger theorem. In each of the eight table columns, rank the **first 29** printed bytes in ascending order as a permutation `R_col[0..28]`, then decode `P_i=C_i−R_(i mod8)[C_(i−1)] mod29`. This unique fixed printed-key interpretation roundtrips the full original and a p57 3,000-rune plant but produces original IoC **0.034437256863**, with no sustained readable text. The all-secret equality result supersedes any further shift/rank/sign menu under exactly this state schedule.

## Exact decision and next causal requirement

**Every** one of the `(29!)^232` directly decodable secret-state permutation models in the frozen `(column mod8, preceding ciphertext rune)` architecture preserves a GP collision rate far below every native-GP English control tested. Do **not** keep testing alternate 29-cell row permutations, byte ranks, AES-derived lookup alphabets, GP-prime shift variants, or fixed S-box substitutions within this state schedule. The original admits no native-GP plaintext comparable to the fixed controls under this family regardless of secret keys.

This does **not** exclude a cipher whose state depends on earlier plaintext, a larger changing key schedule, a different columnar order or punctuation contract, a separate non-GP intermediate, or native text outside the tested language and orthography. No original source supplies the precise state rule, and no previously unknown LP2 phrase was recovered. A productive next step must find an **independent human-visible state transition/key instruction** which predicts at least one complete new GP sentence without selecting a model from its own ciphertext.

**Reproducibility:** [original-source standalone Node22/CommonJS SFT](../sims/lp2_p40_red8_prev29_secret_alphabet_sft.cjs). Inputs are the canonical 58-page GP JSON, original derived 256 printed cells, preserved Shakespeare source and Gibran source. All 3,000 genuine ciphertext symbols, 232 unknown groups, original 663/19,213 counts, 350 native English plants, arbitrary full permutation positive, and exact source setup are asserted. Unlike a language-model optimization, no key search is performed on the original under this all-secret gate.
