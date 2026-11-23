# Signed BASE29 H: all-secret 840-phase original-rune substitution gate

**Agent14, 23 November 2026.** **No unknown LP2 plaintext, key, or author-selected cipher recovered.** This note fixes an exact original-cipher limit for one historically motivated family, independently of any private 840-position key. The source-derived quadratic clock is a possible operand; no authenticated Cicada stage directs its use on unknown LP2 text.

## Source-to-cipher hypothesis

The signed 2013 example explicitly gives `BASE29 3301 = [3,26,24]`. The authentic 2014 sum3301 five-by-five square has exactly these three values as its rational GF29 eigenvalues; the same ascending polynomial `H(x)=3+26x+24x²`, together with original p39 red `G=[27,5,15]`, divides the original 256-token table polynomial. These are three separately verified mathematical observations, summarized in [the source bridge](lp2-2014-3301-square-base29-spectral-original-gate.md). Normalizing `H` gives `x²+18x+11` over GF29. Its root α in GF(29²) satisfies `α²=11α+18` and has **exact multiplicative order 840**. It is a concrete source-derived possible key clock, though no creator opcode selects how to convert field elements into rune transformations.

The inexpensive, maximally permissive *single-GP-rune output* family is

`C[i] = π[(i+phase) mod 840](P[i])`,

where each of the **840 independent π permutations of 29 GP rune values is completely secret**, with no assumed affine form or known initial phase. This grants **(29!)^840** possible phase-specific substitution tables, subsuming direct 840-periodic additive keys, all Caesar-shift variants and every secret period-dividing-840 mono-rune substitution with one book-global clock. It retains the original rune positions and makes no assumption about particular plaintext word breaks. It does not cover state resets between chapters or words, changing periods, state carried by ciphertext, nonbijective transforms, polygraphic algorithms, or non-GP plaintext.

## Key-independent exact invariant

For any two original rune positions `i,j` having `i ≡ j (mod 840)`, bijectivity of their shared table implies:

`C[i] = C[j]  ⇔  P[i] = P[j]`.

This is true for *every* choice of the 840 secret permutations and for *any shared phase offset*. Sum all such equal-pair indicators to obtain a single exactly key-invariant statistic. The original 12,956 unknown LP2 runes furnish precisely **93,540** distinct pairs at equal phase.

| Full original-length GP29 source | Equal-rune pairs within same period-840 phase | Rate |
|---|---:|---:|
| Actual LP2 p0–55, all 12,956 runes | **3,277 / 93,540** | **0.03503314** |
| Authentic 2013 *Book of the Law*, first 12,956 GP runes | 5,781 / 93,540 | 0.06180244 |
| Same author-cited historical book, nine other fixed-length windows | 5,799–5,897 / 93,540 | 0.06199487–0.06304255 |

The ten predeclared window starts in source GP runes are `[0,961,1923,2885,3846,4808,5770,6731,7693,8655]`, each exactly 12,956 runes; complete counts in that order are `[5781,5831,5789,5821,5853,5840,5854,5897,5888,5799]`. Native source text comes from the first-party-relevant three historical `resources/external/2013-book-of-law-{I,II,III}.txt` files and is encoded using the repository’s authentic GP29 transliteration conventions (including V→U, K→C). Their continuous corpus has 21,611 GP runes. These same-source windows overlap, so they are a ten-window finite-control set rather than ten independent literary works. Separately, genuinely clear solved LP2 p57 has 95 native GP runes with standard IoC **0.06270997**; the full original unknown tape's standard IoC is **0.03447840**.

A synthetic 12,956-rune authentic-text control, encrypted with 840 independently phase-specific deterministic Caesar bijections, exactly preserves **5,781 / 93,540** equal pairs. That positive confirms the inference is unaffected by the unknown private tables. The original 3,277 is lower than all ten matched native-text controls by at least **2,504 pair equalities**, or more than 42% of the minimum control count. The original displays roughly uniform per-phase collisions rather than native GP29 prose.

## Decision and limitations

The **entire fixed-period-840 per-phase bijective GP29 single-rune transformation family** cannot turn the original book into any of the tested author-relevant native-GP *Book of the Law* windows or analogous native-GP text with the measured high equality rate, regardless of all 840 private substitutions. It is a finite-source language-register exclusion, **not a theorem eliminating all possible English messages**. It also does **not** dispose of the separately established field-element order840 mathematics, since field multiplication of *two-rune packets* can mix runes, nor does it close a genuinely moving clock that has an independently attested reset/skip marker.

The previously unsuccessful H-derived seeded 840-run key tests were particular algorithms. This stronger exact invariant rules out rescuing them by trying other 840-position phases, arbitrary 29×840 secret substitution tables, or unspecified additive-key bytes under the same continuous book-global per-rune clock. A future successful branch needs an original clue selecting an operation that changes the relevant equality relation and a complete independent plaintext readout.

**Reproduction:** [read-only Windows Node22 single-file test](../sims/lp2_h840_allsecret_phase_permutation_ioc_sft.cjs). It asserts the original 12,956-rune and 93,540-pair scope, all ten native control pair counts, clear p57 reference, and a full-length encrypted native-GP positive. No source image bytes or shared data are altered.
