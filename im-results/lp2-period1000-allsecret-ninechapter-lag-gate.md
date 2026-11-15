# Whole unknown LP2, nine-chapter exact all-secret periodic alphabet gate: periods 1–1000

**Agent 12, 15 November 2026.** No unknown page is deciphered here. This experiment closes a broad, simple, mathematically identifiable class of ciphers against source-native English reference texts: *any fixed-phase monoalphabetic GP29 bijection reused with period m = 1,...,1000 independently in each of the nine source-illustrated chapters*. The unknown keys and their 29-symbol contents are unrestricted.

## Human solve-path premise and exact equation

Original LP2 is printed with 29 Gematria Primus runes and nine chapter-like visual regions. Earlier Cicada solutions use Vigenère-style alphabet shifts, so a human solver might hypothesize one repeating table of substitutions per chapter, possibly with a new secret key at each large red heading. This test grants much more freedom than Vigenère. For each chapter c and candidate integer period m, allow **m completely arbitrary GP29 permutation alphabets** pi(c,0)...pi(c,m−1), distinct across chapters. Encrypt the unknown plaintext at chapter-local rune i as:

    C(c,i) = pi(c,i mod m)(P(c,i)).

At any positions i and i+m inside the same chapter, the phase and secret alphabet are equal. Therefore, with **no knowledge of any key**,

    C(c,i) = C(c,i+m)   if and only if   P(c,i) = P(c,i+m).

This equality is an *exact necessary condition*. It applies to every chapter-specific repeating additive key, affine alphabet, or arbitrary secret permutation. Key search, secret-language guessing and numerical key starts are irrelevant to the equality test.

The premise is deliberately limited: encryption must be symbolwise, bijective, phase-static for the chapter, and preserve relative rune order. The result does **not** exclude distinct phase resets at every word/page, alphabet mutation based on state, non-bijective encoding, transposition, other plaintext languages, or very long periods beyond 1000. The original nine major boundaries are source-visible candidates, not historically authenticated encryption resets.

## Original data, native language controls, and positive plant

The [canonical LP2 source](../resources/liber-primus/lp2-corpus.json) has **12,956 unknown rune indices** on physical pp0–55. The nine original major chapter rune lengths are **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**. For every m, count each equal original pair at chapter offsets i,i+m with i+m inside that chapter. Cross-chapter pairs are excluded from both original and controls. For all m≤1000, the geometric denominator is identical in original and reference.

Three independently sourced English documents already pinned in the repository are translated into the **Cicada source-calibrated GP29 register**, including the historical single-rune ING and IO spellings, as established separately in the [original orthography study](../sims/lp2_native_gp_source_orthography_sft.cjs). The encoder is positively verified by matching **all 95 exact clear GP29 runes of source-authentic p57 PARABLE**, against the entire 20-word known plaintext.

The three source controls are Shakespeare (first 300k characters), Emerson essays, and Gibran's *The Prophet*. Use three deterministic full-length **12,956-rune contiguous windows** from each: the first, the middle, and the last possible window, giving **nine English-GP windows**. Partition each into exactly the nine original chapter lengths before computing pair counts. The method compares unmodified source-native passages, with no word-length fitting and no plaintext or secret substitution tuning.

As a separate synthetic positive, an arbitrary different additive secret alphabet is applied to each of the nine chapters at periods 13, 331 and 1000. The program asserts that equal-lag pairs remain **exactly** equal to the original GP plaintext control. This calibrates the exact all-secret invariant and the chapter reset implementation.

## Original full-family result

Every one of the **1,000** possible candidate periods has an original equal-lag rate **strictly below all nine** native English control-window rates at that same period. The rates are proportions of matching GP29 rune pairs separated by m within an original nine-chapter boundary.

| Period m | Original equality rate | Smallest of nine GP-native control rates | Source context |
| ---: | ---: | ---: | --- |
| 1 | 0.006642 | 0.027651 | Rare original adjacent rune doublets |
| 2 | 0.034008 | 0.037255 | Smallest margin among short lags |
| 3 | 0.033955 | 0.053678 | First substantial lexical-lag signal |
| 5 | 0.036945 | 0.054914 | Literal five-dot motif is not a secret key |
| 13 | 0.034504 | 0.056391 | Original thirteen-dot terminals |
| 29 | 0.034817 | 0.057424 | Gematria alphabet cardinality |
| 35 | 0.035757 | 0.057590 | Local p0 lag-35 peak does not persist bookwide |
| 76 | 0.030476 | 0.058833 | Printed table outer ring count |
| 133 | 0.035972 | 0.056127 | Historical delivery HTML title |
| 331 | 0.034100 | 0.056200 | Historical delivery HTML element ID |
| 464 | 0.036258 | 0.057408 | Number of 2013 prime_echo values up to 3301 |
| 717 | 0.042245 | 0.055700 | **Strongest original nontrivial lag**, still below English |
| 761 | 0.040049 | 0.052488 | 2013 Instar audio prime number |
| 1000 | 0.034763 | 0.056109 | End of prespecified family |

The strongest original excursion from a uniform 29-way lag-match baseline over all 1,000 periods is **m=717: 292/6,912 = 0.042245**, approximately **3.536948** binomial standard deviations above 1/29. It remains below the *minimum* source-native English control rate at exactly lag717. This is a descriptive maximization across a thousand correlated lags, not a discovery-corrected probability or a decoding key.

The m=1 original count is **86/12,947 chapter-local adjacent pairs**. It includes adjacent original page ends/starts *inside* the major chapter; the separately source-audited 86/12,901 result uses only within-physical-page adjacencies. The equality counts in this test should not be misreported as the 55-page denominator.

## Decision and next input needed

For all 1–1000 source-clock periods, **no arbitrary fixed GP29 phase alphabets can transform any of these nine natural GP English controls into the original ciphertext**, because the exact symbol equality is invariant. This is a concrete original-cipher obstruction to a classic human-plausible Vigenère route, including complete independent chapter key reinitialization. It provides no original plaintext, external destination, key, or proof that unknown pages contain the sampled English reference register.

This has greater reach than trials of a handful of key phrases: it gives each of up to 1000 phases its own unconstrained 29-rune permutation and still does not match. The causal next decision is to focus on **changing-state transformations, differently reset clocks, source-authored key material, or independently recovered plaintext**. Do not search longer repeating Vigenère keys within the same 1–1000 fixed-phase chapter architecture unless new first-party evidence specifically demands an unrepresented language or character segmentation.

The [dependency-free Windows Node22 CommonJS SFT](../sims/lp2_period1000_allsecret_lag_collision_sft.cjs) reads the exact original and reference corpora, asserts original source p57 95/95, checks all 1000 periods against the nine controls, tests independent chapter-specific additive-key plants, and reports fixed numeric results. This is bounded *intermediate* evidence; established plaintext and unknown cipher have not changed.

**Independent Windows GitHub Actions execution:** [Manual Node.js 22 run 43765093094](https://github.com/FlareZ123/liber-primus/actions/runs/43765093094) completed **successfully** on 15 November 2026; both source-driven SFTs exited without assertion failure. This establishes exact-script execution in the shared repository, with no unknown plaintext or key claim.
