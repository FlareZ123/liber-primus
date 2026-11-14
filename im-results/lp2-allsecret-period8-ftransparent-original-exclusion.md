# LP2 original period-eight plaintext-F key-space collapse: only sparse keys survive

**Agent47, 14 November 2026. Exact original ciphertext structural result and conditional plaintext-register exclusion. No unknown plaintext, genuine author-specified key, cipher, or destination recovered.**

## Concrete human-visible candidate

The original LP2 p49–51 numeric table consists of **32 rows × 8 columns**, making an eight-position key clock a plausible source-visible interpretation, although the table itself does not identify this cipher. Previously solved LP2 p56 uses **GP29 additive encryption** with *plaintext F* emitted as literal ciphertext F **without consuming a key step**. Transfer only that exact historically observed F behavior to a freely chosen **eight-rune periodic key**. All eight key digits remain unknown, and every original physical page may choose an *arbitrary independent initial phase*. This is more permissive than a single book or chapter phase.

For plaintext index \`P != 0\`, \`C=(P+K[phase]) mod29\` and advance the phase. For \`P=0\`, emit literal ciphertext F=0 and keep phase. An observed ciphertext F may be literal or the encrypted result of non-F with active nonzero key; both possibilities are included. Since every GP29 key is admitted, the opposite additive sign is an equivalent reparametrization.

## Complete search over unknown keys without iterating 29⁸

**One-digit sieve.** Assign any proposed nonzero GP29 value to one key phase and leave all seven other digits completely unknown. On every observed ciphertext F, grant both possible clock actions even if the actual key would not permit them. An **eight-state** finite automaton with every initial phase then supplies a necessary condition for *any* completion. A single source page rejects proposed digits **5 and 20** in every phase, leaving **27 possible digits per key slot**, including zero. The original corpus contains 55 rune-bearing pages and **12,956 ciphertext runes**.

**Two-digit sieve.** Assign two candidate digits at prescribed distinct key phases, leaving the other six unrestricted and granting both clock choices on every F. A pair with no phase path through any one complete original page is impossible for every fully assigned key containing it. Rotational phase symmetry reduces the seven nonzero separations to four. The 27×27 candidate pairs that survive source testing at separation 1,2,3,4 respectively number **322, 347, 336, 307**. The opposite three separations follow exactly by swapping the assigned digits.

Backtrack over all eight key digits, rejecting an entire branch whenever *any pair of assigned digits* fails the source-derived compatibility matrix. This is a safe superset of genuine keys. Nodes visited by completed prefix length 0–8 are:

\`[1,27,322,2369,11996,44397,137723,376731,908729]\`

Only **908,729** full vectors survive this pairwise necessary condition. Each is then tested on all original pages with the **exact historical F skip**, with every page starting in any of eight phases. This is a complete key-space computation: every unvisited vector violated a mathematically necessary condition, so arbitrary secret keys cannot hide outside this search.

**Exact result:** **113** complete original ciphertext-feasible eight-position keys: the all-zero identity, and **112 one-nonzero keys** comprising all eight rotations of each nonzero value

\`[3,4,8,9,11,12,13,14,16,17,18,19,21,27]\`.

**No key with two or more nonzero digits survives.** Those 112 sparse keys are rotations of just 14 unique one-slot patterns because page start phases are free. If one requires a *single continuous clock across the book*, every nonzero candidate fails on the original ciphertext; the identity is the sole survivor.

## Strong key-independent upper bound on possible plaintext changes

Any surviving one-slot key changes only one rune per eight consumed positions at most. Across 55 original rune-bearing pages, even allowing the most favorable independent starting phase on each page, the maximum number of changed rune positions is

\(\sum_{\text{page}}\lceil n_{\text{page}}/8\rceil=\mathbf{1,644}\)

of **12,956** ciphertext runes, or **12.6891%**. This bound accommodates every plaintext-F clock ambiguity.

The original marginal GP29 entropy is **4.856503613708271 bits/rune**. Even if one were allowed to replace **any** 1,644 rune positions with arbitrary symbols, the smallest possible empirical entropy is **4.474446375590346 bits/rune**. This exact information-theoretic lower bound comes from placing all possible replacement counts into the originally largest symbol class, removing them from the smallest classes first; the resulting maximally concentrated histogram majorizes every other attainable histogram.

The independently documented [GP-native prose reference windows](lp2-cipher-feedback-conditional-entropy-gate.md) have marginal entropy at most **4.28909395** bits/rune across 89 roughly length-matched Shakespeare, Gibran and Emerson samples. Therefore none of the surviving 112 nontrivial page-reset keys can decrypt the original manuscript to that tested ordinary-English register. This is conditional on the expected plaintext register; another language or a higher-entropy intermediate representation remains logically possible.

## Positive control, limits and decision

A 95-rune original unencrypted GP p57 source plant is encrypted with a nontrivial eight-slot key and hidden initial phase. Its three plaintext F runes skip consumption, so **92** key positions are consumed and the exact original decoder accepts the full planted ciphertext. It checks the cipher model without presuming an answer for unknown pages.

**Decision:** for the historically motivated eight-phase **same-key GP29 additive F-transparent** family, the only book-continuous key is identity; every page-reset survivor is too sparse to recover ordinary GP-native English. Do not begin another eight-column repeated-key search without an original clue that changes its cipher operation or its independent per-page key schedule. The separate [period-five](lp2-allsecret-period5-ftransparent-original-exclusion.md) and [period-seven](lp2-allsecret-period7-ftransparent-original-exclusion.md) all-secret gates imply the same priority change for short fixed periods. These structural rejections supply neither an authentic decryption nor recovered plaintext.

[Successful Windows Node22 CI 43633251541](https://github.com/FlareZ123/liber-primus/actions/runs/43633251541) · [Standalone Windows Node22 CommonJS reproducer](../sims/lp2_allsecret_period8_ftransparent_exact_sft.cjs) · [canonical original GP29 input](../resources/liber-primus/lp2-corpus.json).
