# P8 243-rune table: exact five-trit key obstruction and rank28 extension

**Agent36, 22 November 2026.** An original-cipher, key-independent frequency bound excludes every static 243-state GP29 substitution table indexed by the previous five ciphertext trits as a direct decoder of ordinary GP-English on physical pp9–55. A fully reversible predecessor-rank28 extension using the literal 243 p8 black runes also fails to recover natural GP prose. Both results passed [Windows Node22 CI run 45002034941](https://github.com/FlareZ123/liber-primus/actions/runs/45002034941). **No unknown-page plaintext, key or continuation was recovered.**

## Source cue and candidate operation

Physical p7 has five complete red words whose GP-index products modulo 29 are exactly **[11,26,8,15,2]**. Physical p8 contains **243 contiguous black GP runes = 3^5**, following twelve red runes. These visible counts motivate interpreting the p8 body as a complete table of five-trit states. This geometric interpretation is a hypothesis. No authenticated Cicada instruction identifies those 243 runes as a cipher table or specifies trit conversion.

First, give every state selected by the last five ciphertext trits an independent, arbitrary secret **29-symbol permutation** of plaintext runes. The two source trit conversions are GP index modulo 3 and GP prime weight modulo 3. Grant 243 unrelated secret alphabets, far beyond a single printed table of 243 symbols. Test a continuously held state clock and a clock reset on each original physical page using p7's five red-word products as history. Original input is exactly 10,827 untouched GP29 runes on physical pp9–55, with runeless p50 skipped.

## Exact all-secret bound

For each state s count ciphertext output symbols, forming a 29-column row M[s]. A secret permutation can assign any k plaintext labels only to k **distinct** ciphertext values. Therefore U(k), the sum across states of each row's k largest ciphertext counts, is an exact maximum for how often any k plaintext runes can occur under **every possible secret table**. No cipher key or plaintext prediction is fitted.

| Five-trit key | Reset | Visited states | U(1) out of 10,827 | U(2) | U(3) | U(4) |
|---|---|---:|---:|---:|---:|---:|
| GP index mod3 | Each original page | 243 | **1,108 (10.23%)** | 2,016 | 2,830 | 3,560 |
| GP index mod3 | Continuous book | 243 | **1,117 (10.32%)** | 2,028 | 2,839 | 3,575 |
| GP prime mod3 | Each original page | 155 | **820 (7.57%)** | 1,513 | 2,144 | 2,714 |
| GP prime mod3 | Continuous book | 155 | **817 (7.55%)** | 1,512 | 2,141 | 2,713 |

Only 155 prime-trit states are observed because all GP primes greater than three fall in residues 1 or 2 modulo3. The continuous-book index bound even tolerates five *arbitrary initial state assignments*: adding five completely free plaintext positions gives at most **1,122/10,827 = 10.36%** for any one plaintext rune.

The established native-GP encoder exactly reproduces independent solved LP1 and p57 control readings. Sample fixed-stride, 10,827-rune reference passages from three independently checked-in English sources:

| Reference | Fixed windows | Minimum frequency of most common GP rune | Minimum top-two frequency |
|---|---:|---:|---:|
| Shakespeare | 39 | **10.91715%** | 19.02651% |
| Gibran | 10 | **11.06493%** | 19.79311% |
| Emerson | 58 | **11.64681%** | 19.46061% |

All **107** native-GP reference windows exceed every candidate's exact U(1) and U(2) bounds. Two independent genuine-GP positive plants under secret state-specific affine mappings encrypt and reconstruct **1,200/1,200** runes exactly, confirming the bound accepts a real cipher of its declared class. The source controls are finite and partly overlapping; the exclusion applies to the tested native GP-English register, not every conceivable plaintext distribution.

## Reversible p8-table rank28 feedback extension

The exact prior-ciphertext rune can also influence emission. In that larger architecture the 243-state-only bound does not apply. The very low number of original immediate ciphertext repeats makes this branch worth its own complete inverse test.

Fix T as the 243 literal black p8 rune indices. Before each source rune, form the five-trit table address from either previous ciphertext or recovered plaintext values, reduced by GP index or GP prime mod3. For each ordinary plaintext rune P in 0..27, emit C as the previous ciphertext rune plus the nonzero step 1 + ((P - sign*T[address]) mod28), modulo29. For P=28 (EA), emit a zero step. The visible zero/nonzero difference makes this map **bijective** for each complete state. Its inverse maps a zero step to EA and otherwise computes P=((C-current minus previous minus 1) + sign*T[address]) modulo28, after reducing T modulo28. Both signs, both five-trit orders, both state histories and both page/book clocks yield **32 frozen receivers**, initially seeded by the actual five p7 products.

Each of **32 separately encrypted native-GP 1,200-rune plants recovered all 1,200 GP runes exactly**. On original p9–55, raw ciphertext rune IoC is **0.03449302**, and every resulting GP29 output has IoC below **0.03534**. Best original candidate is **0.03532834** with prime-weight trits, recovered-plaintext history, positive sign, continuous book clock, and chronological five-trit address. A native-GP source plant has IoC **0.06054907**. None of the 32 actual candidates produced a readable original plaintext interval.

## Decision and reproducibility

The exact result retires **any static five-trit-state GP29 substitution table** as a direct native-GP-English decoder, including tables with entirely unknown secret entries. The predecessor-dependent rank28 test retires its **32 literal p8 lookup variants**. Other dynamic states, nonbijective or variable-length encoders, different source plaintext languages, and more complex p8 operations remain possible; additional parameter searches need an independently visible author clue.

[Complete Windows-compatible CommonJS SFT](../sims/lp2_p8_ternary5_rank28_allsecret_sft.cjs) verifies original source identities, exact counts, native reference controls, and positive inverses. [Windows Node22 PASS run 45002034941](https://github.com/FlareZ123/liber-primus/actions/runs/45002034941). This is intermediate support under im-results, not newly authenticated plaintext.
