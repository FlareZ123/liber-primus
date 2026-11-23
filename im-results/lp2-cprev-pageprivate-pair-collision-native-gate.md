# LP2: page-private predecessor-alphabet collision constraint

**Agent4 · 23 November 2026 · original-input research constraint.** No unknown plaintext, authentic key or complete cipher recovered. This result examines the one predecessor-keyed family that survives the exact global 29! majorization theorem: **a different arbitrary secret alphabet for every preceding ciphertext rune on every physical page**.

## Exact original observable and what it proves

Let \\(C_i\\) be a canonical GP29 ciphertext rune. On each original physical page, consider the fully reversible page-private cipher

\\[
C_i=\pi_{page,C_{i-1}}(P_i),\qquad
P_i=\pi_{page,C_{i-1}}^{-1}(C_i),
\\]

where **each of the 55×29 output alphabets may be any private 29! permutation**. The initial predecessor is an arbitrary private state and its ciphertext position is omitted from the test.

For every two positions \\(i<j\\) in the **same physical page** with \\(C_{i-1}=C_{j-1}\\), permutation injectivity gives

\\[
[C_i=C_j] \iff [P_i=P_j].
\\]

Consequently the total equal-follower pair count **within each observable (page, previous ciphertext) row** is invariant under **every** secret choice of that row's permutation. This does not require knowing the alphabets, guessing GP prime arithmetic, or preserving word boundaries.

Define \\(n_{p,s,v}\\) as the count of original follower rune \\(v\\) in page \\(p\\) after predecessor \\(s\\), and \\(n_{p,s}=\\sum_v n_{p,s,v}\\). The original key-independent conditional collision rate is

\\[
Q=\frac{\sum_{p,s,v}\binom{n_{p,s,v}}2}
        {\sum_{p,s}\binom{n_{p,s}}2}
 = \frac{1919}{54009} = 0.03553111518450629.
\\]

These original counts cover **12,956** unchanged encrypted runes on **55 rune-bearing physical pages**, with the first rune of each page omitted as an output observation. The one runeless p50 remains an empty page, not a page-index shift.

## Source-shaped native-English positive calibration

The accompanying [read-only CommonJS SFT](../sims/lp2_cprev_pageprivate_paircollision_native_sft.cjs) builds exactly the 55 original physical-page layouts from the original transcription. Their **2,928 page-local word fragments** are different from the **2,896 manuscript-wide complete printed words** because some words carry between physical pages. Each fragment is replaced by a randomly sampled source-exact GP29 word of the same rune length from the **740 already-solved Cicada source words** in `resources/external/relikd-solved-gp29-native-v1.json`.

For each of **500** deterministic trials (xorshift32 initial seed `0xc4a5be33`) the SFT makes **55 fresh independent 29×29 bijective secret tables**; each of their 29 rows is independently Fisher–Yates shuffled. The first previous-cipher state on every page is secret and arbitrary. It encrypts all 12,956 GP29 donor runes, decrypts all of them under the true hidden tables, and checks both exact plaintext recovery and the row-pair-collision identity.

| Measure | Conditional equality (Q) |
| --- | ---: |
| Original unknown LP2 | **0.03553111518450629** |
| Lowest of 500 authentic native-GP ciphertext plants | **0.05996633720097407** |
| Median plant | **0.06466131045516077** |
| Highest plant | **0.06861750507241307** |
| Native plants at or below original | **0/500** |

The empirical lower-tail rank under this **specific** source-word donor and random-secret-key generator is smaller than 1/501. All 500 positive source-native complete ciphertexts round-trip and satisfy the algebraic invariant. [Windows Node22 PASS, 23 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45095523846). A preliminary independent 200-trial JS calculation using the same source inputs found 0/200 below the original; the committed script's definitive values use 500 trials.

## Pagewise viability fork: terminal p55 is not excluded

A second [source-exact Windows PASS run](https://github.com/FlareZ123/liber-primus/actions/runs/45099041682) adds an original-state **per-page** view to the same deterministic 500-book SFT. Each one-page native control has its own valid 29-row secret permutation, true decrypt replay, original printed word-fragment lengths, and distinct page seed state; the full-book total and all 500 previously published Q values are bit-identical.

| Physical page | Original rune count | Original page Q | Native controls with Q ≤ original, among 500 |
| --- | ---: | ---: | ---: |
| 0 | 262 | 49/1169 = 0.0419162 | 3 |
| 7 | 208 | 37/768 = 0.0481771 | 22 |
| 27 | 234 | 46/915 = 0.0502732 | 17 |
| 49, pretable fragment | 66 | 2/60 = 0.0333333 | 92 |
| 51, posttable fragment | 92 | 4/134 = 0.0298507 | 24 |
| **55, 76-rune final unknown** | **76** | **5/104 = 0.0480769** | **118** |

These page indices were selected as diagnostic pages because they are the opening, long red-section transitions, two typed numeral-table flanks and short final unknown, **not** as a familywise page-selection significance claim. The p55 source could perfectly well be a typical length-matched private-predecessor-table ciphertext under this statistic (118/500, 23.6% lower tail). By contrast the 55-page complete-book source Q lies below every complete-book control because the numerous longer pages accumulate evidence. **Do not apply the full-book empirical exclusion to p55 alone.** It remains an appropriate intact 76-rune original target if a genuine source-selected decoder materializes. The statistic itself supplies no key.

## Constructive all-secret ambiguity on untouched p0

The random-key rejection must not be overread as an absolute no-key theorem. A separate [full-page original-cipher ambiguity SFT](../sims/lp2_p0_pageprivate_secret_table_ambiguity_sft.cjs) now supplies **two explicit different 59-word GP29 word mosaics**, each exactly 262 GP29 glyphs long, **with every original page0 word length and rune boundary preserved**. The words were selected adversarially from an English vocabulary; they include proper names and disconnected clauses, and use an explicitly approximate Latin→GP29 spelling converter. **They are deliberately noncoherent control strings, not candidate authentic plaintext.**

For *each* mosaic independently, the SFT derives 29 exact secret predecessor-row permutations, fills every unobserved row cell to a complete bijection, and supplies an independent reversible first-rune initialization. Every original source ciphertext index decrypts to the chosen mosaic, and the exact reconstructed forward ciphertext matches **262/262 original glyphs**. There are **215 distinct constrained predecessor/follower edge cells** on p0. The two independently fabricated plaintext strings disagree at **238/262 rune positions**, while both retain full printed word layout and satisfy exactly the same source ciphertext. [Windows Node22 PASS run 45097419774](https://github.com/FlareZ123/liber-primus/actions/runs/45097419774).

This is a constructive **key nonidentifiability witness** for arbitrary author-unspecified page-private alphabets: full source ciphertext agreement, source word shapes and existence of meaningful English dictionary tokens are not sufficient to identify which private table or plaintext is genuine. The witness *does not* establish that a whole fluent GP-native English passage can reproduce original Q, and it does not weaken the random-key native-English separation above. To advance toward unknown plaintext, a creator-selected **compact key schedule, changing-state opcode, or independent genuine plaintext crib** is still mandatory.

**Human key-description cost.** A literal unconstrained independent 29-symbol permutation for each of the 55×29 page/predecessor rows spans log2((29!)^(55×29)) ≈ **163,969 key-selection bits**, roughly **2.61 times the 12,956-rune original's raw GP29 storage length of 62,940 bits**. This measures a space of possible private keys, not the author's actual key entropy. An author could instead supply a compact deterministic generator with a short seed. No currently authenticated original instruction has selected that generator or seed; its output might differ from the random-secret controls. This supplies an independent human-puzzle reason to demand an externally source-specified short key schedule before treating any arbitrary-row fit as a genuine solution.

## Decision and exact limitation

This is a **new original-data separation** for the previously still-feasible *page-private predecessor-alphabet* cipher, beyond the earlier static global, five-phase and nine-illustrated-section 29! exclusions. Ordinary source-native solved-Cicada prose encrypted under arbitrary **randomly drawn private page dictionaries** retains substantially higher predecessor-row equality than original LP2. It disfavors the simple page-private substitution explanation and indicates that sampling more random page dictionaries is unlikely to recover authentic plaintext.

The equality identity **does not by itself exclude every possible deliberately engineered 55×29 table key**, as the exact full-page p0 ambiguity witnesses above constructively demonstrate. The hidden key affects which ciphertext predecessor groups the authentic plaintext occupies, and an adversarial, highly structured key might produce a different grouping from the random-key calibration. A non-native plaintext distribution, extra hidden state, changed word boundaries or reversible constrained coder also lies outside this test. Full original-cipher replay under a guessed key remains necessary but never sufficient to identify that key.

**Fork:** Demand a new *source-selected* page-private transition law or private table before further per-page dictionary guessing; otherwise prioritize independently motivated changing-state / boundary-changing mechanisms. The original transcript yields **no plaintext and no key** from this statistic.

## Inputs and exact reproduction

- Unmodified canonical 58-page GP29 indices: `resources/liber-primus/lp2-corpus.json`
- Original physical words, page breaks and carry: `resources/liber-primus/lp2-transcription.txt`
- Existing 740-source-word authentic GP29 solved donor: `resources/external/relikd-solved-gp29-native-v1.json`
- Script: `node sims/lp2_cprev_pageprivate_paircollision_native_sft.cjs` under Node.js 22 from the repository root
- CI: [manual Windows Node22 source test, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45095523846)
- Preceding stationary/global majorization reference: [original all-secret predecessor theorem](lp2-cprev-secret-table-majorization-original-gate.md)
