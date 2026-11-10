# LP2 lag-six affine echo: word-local evidence and a finite-family correction

**Classification:** externally reported ciphertext anomaly, independently reproduced and subjected to stronger constrained controls. It identifies no manuscript plaintext, key, or proven encryption mechanism.

## Observable relationship and intact input

The external [pnotisdev study](https://github.com/pnotisdev/cicada3301/blob/main/results/analysis/echo_values.txt) identified an unexpectedly common ciphertext relation within displayed words, with zero-based canonical Gematria Primus rune indices:

\[
c_i=(24-2c_{i-6})\bmod29.
\]

The first 55 rune-bearing LP2 records of \`resources/lp2-transcription.txt\` contain **12,956 runes in 2,896 true words**. Print lines and physical page breaks do not split words. Of these, 559 words contain at least seven runes, giving **1,290** eligible six-apart positions. Exactly **80** satisfy the affine equation, spread across **74 distinct words**; 68 words have one match and six have two. The rune-value fixed point of the affine map is index 8. The two already-solved closing pages and the numeric-only physical page 50 are excluded.

## Word-conditioned null with affine-orbit correction

The original independent [reproducer](../sims/lag6_conditioned_echo.cjs) shuffles each word's rune positions and accepts a shuffle only when its **exact count of adjacent equal rune pairs** equals that of the original word. This holds fixed each word's full rune multiset, length, and immediate-repeat count. It therefore addresses the unusual LP2 rune profile directly.

Under 3,000 deterministic whole-corpus randomizations (xorshift seed \`0x38a729bb\`), the 80 observed matches compare with a null mean **45.9337**, SD **6.5326**, minimum 24, maximum 75, fixed-transform upper p **0.0003332**. The affine map \`T(x)=24-2x\` has a fixed point at x=8 and a single 28-cycle on the other 28 values; scoring all **28 powers** of that one map in every null likewise produces 0/3,000 maxima reaching 80 (orbit-familywise p **0.0003332**). This is a *limited orbit correction*, not a search correction over arbitrary affine maps and lags.

## Complete affine search at seven lags

The new [full-family implementation](../sims/affine_echo_global_search.cjs) tests every bijective affine function \`a*x+b mod29\`, for \`a=1..28\`, \`b=0..28\`, and every within-word lag in \`{2,3,4,5,6,7,8}\`: **5,684** candidate models. For each model, 400 constrained null manuscripts establish fixed mean and SD. A separate set of 1,000 null manuscripts calibrates the **maximum standardized score over all 5,684 models**, repeating the full search and accounting for winner selection *within this family*. The deterministic seed is \`0x19871519\`. In each random manuscript, every word retains its original multiset, length, and adjacent-doublet count.

| Measurement | Actual LP2 | Independent maximum-null calibration |
|---|---:|---:|
| Highest-ranked model | lag 6, a=27, b=24 | all 5,684 reranked for each null |
| Matches | **80 of 1,290** | fixed-model expected **45.775**, SD **6.653899** |
| Standardized maximum | **5.1436006** | mean max 4.0214154; 95% max 4.7505917; 99% max 5.2092536 |
| Exceedances | | **12/1,000** independent null maxima |
| Corrected empirical p | | **13/1,001 = 0.0129870** |

The next-best actual candidates have z=3.9521 (lag5, a23, b15), 3.8070 (lag2, a11, b4) and 3.7857 (lag5, a16, b7). The original lag-six map remains the strongest after the expanded finite-family search. The 80 true matches divide into **40** in the first 1,448 words and **40** in the last 1,448. Both halves were previously exposed to the historical hypothesis search, so their numerical agreement is a stability check rather than a new held-out discovery.

**Scope:** These p-values correct all 5,684 exactly specified models. They do not cover the broader historical search for other formulas, different lag families, statistics, transcriptions, or models that prompted attention to this relation. The original count alone is insufficient to infer a deliberate error-correction or overwrite channel.

## Word-boundary contrast

Run the affine test at lag six on the *continuous canonical rune stream*, tracking whether the two compared rune positions belong to the same complete word. In that analysis:

| Pair type | Eligible pairs | Affine matches | Rate |
|---|---:|---:|---:|
| Both rune positions in same word | 1,290 | **80** | **6.2016%** |
| Rune positions belong to different words | 11,660 | **402** | **3.4477%** |
| Within the same physical page and word | 1,267 | 77 | 6.0773% |
| Within physical page, across word boundary | 11,359 | 389 | 3.4246% |

The between-word value is close to the uniform-cipher benchmark \`1/29 = 3.4483%\`. The pattern is therefore concentrated where a word-scoped repair or insertion rule could operate. This is an additional descriptive contrast on the same selected affine formula, not an independent proof. Continuous-stream counts cross physical page boundaries, while page-local rows exclude them.

## Independent GP-English word-length register comparisons

A new [reproducible literary control](../sims/affine_echo_literary_control.cjs) converts three public-domain English corpora to GP runes with greedy \`TH/NG/EA/EO/OE/AE/IA\` digraph handling and declared \`QU/V/K/Z\` aliases. Each of 5,000 seeded bootstrap trials samples *whole English words with replacement* of the **exact lengths** of the original 559 eligible LP2 words, preserving the real word-length composition. This is a different control from the per-word-multiset randomization above.

| Reference | Expected lag-six affine matches (SD) | Fraction of reference samples reaching actual 80 |
|---|---:|---:|
| Shakespeare (300k-character source) | 62.9792 (7.4499) | 0.014797 |
| Gibran, *The Prophet* | 54.6200 (7.3533) | 0.001600 |
| Emerson essays | 52.6184 (7.2403) | 0.000600 |

The comparison also includes the independently documented [lag-five same-\`ᛋ\` echo](lag5-rune-specific-echo.md). Its actual 11 matches contrast with matched-English expected counts of **17.2586** (Shakespeare), **22.5582** (Gibran), and **19.9752** (Emerson). Thus this second signal is conspicuous relative to *LP2's own wordwise randomization*, while ordinary English can contain even more of that specific 5-apart repeated \`S\` sequence at the same word lengths. This distinction makes a natural-English leakage explanation require a genuine enciphering mechanism rather than an uncalibrated coincidence analogy.

The references are author- and transcription-dependent and do not simulate a realistic unknown LP2 cipher. Their empirical tail fractions are comparisons of already-selected features and cannot be treated as independent discovery-wide p-values.

## Source-marked 36-page affine transport and limited original-cipher prediction

The *previously discovered*, post-selected lag-six map T(x)=24−2x mod29 also gives a concrete cross-page original-source calculation, independent of arbitrary unknown-key fitting. The manuscript's **only two red three-rune spans**, both marked by 13-dot punctuation, begin at **the same local rune offset 119** on physical pages **3 and 39**. The page gap of 36 fixes the reverse-iterate map by the exact full-order-28 formula:

\[
T^{-36}(x)=8+(-2)^{-36}(x-8)=23x+27\pmod{29}.
\]

The source red indices are p3 **[13,23,2]** and p39 **[27,5,15]**. The derived multiplier **23** equals p3's middle marked rune, while its intercept **27** equals p39's first marked rune. The *two aligned red payload* equalities are f(23)=5 and f(2)=15. This uses both marked red triples, an independently measured 36-page separation, and the already-observed affine transform. The first marked rune does **not** obey this same 36-page transport (f(13)=7 versus actual27). It separately satisfies T(13)=27, an exact but retrospectively recognized first-step relation.

**One source-disjoint glyph prediction:** Immediately after both three-red-rune spans sits another visible red 13-dot mark (rendered '.' in the transcription); the following first **black** rune at local position122 has GP index **12** on p3 and **13** on p39. The red-derived map correctly predicts **f(12)=13**, and that target black rune also repeats the p3 first red index13. Thus the source-marked four-position windows comprise p3 **[13,23,2 | 12]** and p39 **[27,5,15 | 13]**, with the vertical stroke denoting the next 13-dot punctuation boundary, not a rune. The derived f has exact order **7**, fixed point8, and four seven-cycles on the other 28 rune indices. These are arithmetic observations, not independently proved creator instructions.

The full aligned physical page-pair supplies **7/217** affine matches (uniform reference **7.48**), with the three consecutive matches only at indices120–122. Across the **19** available page pairs spaced by exactly36 (4,010 aligned positions), that is the **only three-position consecutive run** under the same fixed map. The absence of full-page enrichment contradicts a literal one-layer global 36-page affine copy. The correctly predicted single post-marker black rune is intriguing but remains a 1-of-29-type conditional confirmation; map family, direction, and relevant source symbols were identified after extensive manuscript exploration. It does not supply an original LP2 key, plaintext or successful message extraction.

[Source-exact finite census and reproduced punctuation grammar](../sims/agent19_red_triad_gap36_transport_sft.cjs) · [successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42921976881). A fruitful next *source-constrained* test would identify a visible punctuation-triggered state update and predict multiple previously unused glyphs outside the two small marked windows. Changing affine exponents to match additional ciphertext is not evidence of that mechanism.

## Mechanistic implications and next inversion test

The word-local excess over the constrained randomization is **34.225/1,290 = 0.02653 additional matches per eligible pair**. This is numerically close to a collision-rejection frequency of approximately \`0.81/29 = 0.02793\` in a uniform-symbol model, as earlier outside researchers observed with a different null. The similarity motivates a **latent collision-repair channel**: a tentative output equal to its previous rune might be replaced by \`T(c_(i-6))\` when six prior runes are present in the same word. That example is a *hypothesis*, and its apparent rate match is not plaintext evidence. A direct overwrite of the original symbol could also destroy information, requiring an explicit reversible protocol or erasure recovery.

A discriminating attack must specify how key draws, word boundaries and a possible inserted/replaced rune interact, then use the same parameters to predict ciphertext under a candidate key and to re-encrypt independently recovered plaintext. It should also explain the separate lag-five \`ᛋ\` excess, and should test whether the proposed repair rule itself creates both echoes before introducing an unconstrained second mechanism.

## Reproduce

- Inputs: \`resources/lp2-transcription.txt\`, \`resources/control/shakespeare_first300k.txt\`, \`resources/control/gibran_prophet_58585.txt\`, and \`resources/control/emerson_essays_2944.txt\`.
- Full exact code: [all 5,684 affine models and boundary contrast](../sims/affine_echo_global_search.cjs), [original orbit/permutation test](../sims/lag6_conditioned_echo.cjs), and [length-matched literary register comparison](../sims/affine_echo_literary_control.cjs).
- On-demand Node.js 22 CI: [successful run 42752182238](https://github.com/FlareZ123/liber-primus/actions/runs/42752182238) reproduces both new scripts, as did [run 42751340101](https://github.com/FlareZ123/liber-primus/actions/runs/42751340101) for the full-family experiment alone.
- Prior art: [pnotisdev LP2 echo measurements](https://github.com/pnotisdev/cicada3301/blob/main/results/analysis/echo_values.txt). These observed formulas are credited to the earlier outside search; the finite-family correction and referenced manuscript controls are the additions recorded here.
