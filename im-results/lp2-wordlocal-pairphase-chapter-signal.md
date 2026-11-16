# LP2 word-local odd/even doublet phase: a conditional early-chapter asymmetry

**Agent2, 16 November 2026. Evidence class:** a reproducible, exploratory, *original-cipher positional observation*, with a word-multiset control and a direct candidate-inverse failure. **No unknown Liber Primus plaintext, source-authenticated cipher, historical key or destination was recovered.**

## Distinct original-only question

The confirmed 86 same-page adjacent equal runes and 104/2,105 within-word fiveback echoes describe LP2's near-random cipher. A different question asks whether the *63 doublets inside the 2,896 original typographic words* prefer one position of a two-rune word-local clock. This matters to cipher architecture: a 29×29 pair map beginning at each **original word** would treat pairs (rune0,rune1), (rune2,rune3), ... differently from the connections between pairs (rune1,rune2), (rune3,rune4), ... . The source provides word breaks independently of the ciphertext analysis, but **no authenticated authorial pair cipher**.

The [original-input CommonJS test](../sims/lp2_wordlocal_pairphase_chapter_sft.cjs) parses canonical `resources/lp2-transcription.txt` without changing rune identity, holding 32 actual page-spanning words intact and joining only transparent line/page wraps. It checks **12,956 glyphs, 2,896 words, 63 within-word doublet sites**. In a word `w[0..L−1]`, the second rune of a doublet lies at local index `i≥1`: *odd* `i` means inside a hypothesized pair; *even* `i` means between pairs. P50 contains only numerals, and the original 9 visual chapters provide source-fixed boundaries.

## Exact source counts

| Original visual chapter (physical pages) | Rune count | Original words | Odd-pair doublets | Between-pair doublets |
| --- | ---: | ---: | ---: | ---: |
| 1 (0–2) | 729 | 158 | 0 | 2 |
| 2 (3–7) | 1,145 | 255 | 2 | 2 |
| 3 (8–14) | 1,729 | 383 | 2 | 5 |
| 4 (15–22) | 1,903 | 437 | 4 | 6 |
| 5 (23–26) | 1,021 | 224 | 2 | 7 |
| 6 (27–32) | 1,433 | 326 | 5 | 3 |
| 7 (33–39) | 1,680 | 378 | 3 | 5 |
| 8 (40–53) | 3,008 | 669 | 9 | 5 |
| 9 (54–55) | 308 | 66 | 0 | 1 |

The **first five original chapters** contain **6,527 runes, 1,457 words and 32 within-word doublets**. Only **10** doublets occupy odd/local-inside-pair positions, versus **22** at even/local-between-pair positions. The number of eligible original within-word transitions is **2,903 odd** and **2,167 even**. The last four chapters contain **6,429 runes, 1,439 words**, with **17 odd and 14 even** of their 31 interior doublets. The whole manuscript contains 27 odd and 36 even of 63 events; a manuscript-wide-only test dilutes the local signal. The other 23 same-page doublets **cross printed word boundaries** and are deliberately outside this word-local test.

All **32** first-five-chapter doublet-bearing words have **exactly one** within-word doublet. The only word in the entire original unknown release with *two* within-word adjacent repeat positions occurs on p27 (local indices 5 and 11), outside the early subset.

## Event-bearing-word conditional test

Holding each observed doublet-bearing word and its exact length fixed, the null places its single doublet uniformly among the `L−1` eligible adjacent positions. Hence the probability of falling inside a hypothetical pair is `ceil((L−1)/2)/(L−1)` for that particular word. The independent 32-event Poisson-binomial convolution gives:

- Original first-five-chapter **observed odd events: 10**, versus exact conditional expectation **18.2924963925**.
- Source-word-conditioned *one-sided* probability of **10 or fewer: 0.0025498509051**.
- Doubled-tail *two-sided* probability: **0.0050997018101**.

The first-five-chapter endpoint was inspected during exploration, so the test also scores **all eight potential cumulative cutpoints** between the nine original visual chapters. Their exact conditional two-sided p-values are `[0.428571, 0.531937, 0.101933, 0.037887, 0.005100, 0.016746, 0.006372, 0.041528]`, with the minimum at cut 5. With **250,000 seeded conditional simulations** (`0x20510627`), **3,021** trials attain as small a minimum p among the eight prefixes, giving a *familywise descriptive p ≈ 0.012088*. The rigorous eight-comparison Bonferroni upper bound is **0.040798**. These correct for the eight tested chapter-prefix cutpoints, **not** the hundreds of other unrelated tests previously tried by the larger solver population.

**Stronger fixed-word-multiset comparison.** Independently permute the *actual original glyphs* of each of the 32 early repeat-bearing words, accepting only arrangements that retain exactly one adjacent doublet. A fixed RNG seed `0x33012026` and **8,000 accepted permutations per word** yield a conditional mean **18.3345** odd events; the resulting one-sided event-count probability is **0.0024294** and doubled-tail **0.0048588**. Every word contributes its original rune multiset and length. The effect is therefore not explained solely by the observed source word lengths or which specific source words have one adjacent repeat.

Original **LP1** is a useful independent type-set runic control under the same word parser: all 2,797 source glyphs / 694 words contain **30 odd and 21 even** within-word doublet sites (conditional two-sided p **0.936**); its first three transcribed blocks contain 12 odd and four even among 16 (two-sided p **0.229**). These controls are heterogeneous solved material and do not prove that the LP2 early-chapter signal is cryptographic.

### Specificity against all 29 rune-difference labels

For the same first-five-chapter word-local transitions, the **known doublet event is exactly GP29 modular difference zero**. The SFT contrasts the odd/even counts for *every* modular difference residue `Δ=C[i]−C[i−1] mod29` under the same 2,903/2,167 eligible positional opportunities. Of all 29 differences, **zero is the largest absolute standardized odd-versus-even imbalance** (10 odd/22 even; approximate z **−2.9834**); difference **27** is second (116 odd/56 even; z **+2.7467**). The other 27 differences have |z| at most **1.6943**. Thus the observed zero-step pair-phase deficit is relatively specific among the 29 tested step values. The 27-step excess might suggest a collision-replacement operator, but **27 was discovered retrospectively**, its sign/placement has no first-party operator or key, and its z value does not survive treating all 29 residues as independently proposed cryptographic instructions. Do not turn this diagnostic into an unmotivated ±2 step-swap or rotor sweep.

## Key-independent exclusion: stationary word-aligned block substitutions

The earlier [hard Playfair pair-alignment gate](lp2-polygraphic-pair-alignment-gate.md) establishes that **27/63** original within-word doublets fall *inside* source word-initial two-rune blocks. Thus a *hard no-equal-pair* classical Playfair cannot explain all source ciphertext. The chapter-conditioned 10/22 early skew here refines that established global 27/36 count; it is not a proof of a soft or hard Playfair key.

This is an **untouched full-GP29, word-initial 2/3/4-rune refinement** of [Agent20's earlier key-independent GP27 block collision theorem](lp2-trifid27-allsecret-original-block-collision-gate.md), which already established the generic collision-invariance argument and tested word/book/page 3/5-rune full blocks under two literal bypass symbol assumptions and native-source plants. The present contribution is the **new chapter-conditioned original word-phase observation and the exact 29-symbol, no-bypass early/late aligned-block counts**, including the four-rune word-start gate. It does not claim to originate the general permutation invariant.

More generally, **every stationary bijection on a complete, word-initial, non-overlapping block of `b` GP29 runes preserves the exact number of repeated block labels**, no matter how many secret lookup entries it has. For blocks `B_i`, a fixed permutation `f` satisfies `B_i=B_j ⇔ f(B_i)=f(B_j)`. This includes all stationary secret 29²-entry digraph tables, secret 29³-entry trigram tables, and stationary 4-rune permutations, including a fixed invertible Hill4 map with word-local resets. It requires *no key search* and is independent of how the table entries are shuffled.

The [original-input SFT](../sims/lp2_wordlocal_pairphase_chapter_sft.cjs) freezes the source printed word boundaries and takes blocks at word offsets `0,b,2b,...` (dropping only the final incomplete block from each word for this statistic). The original source emits:

| Source-original words | Complete `b=2` blocks / repeated block pairs | `b=3` blocks / repeated block pairs | `b=4` blocks / repeated block pairs |
| --- | ---: | ---: | ---: |
| LP2 pp0–26, 1,457 words | **2,903 / 5,202** | **1,718 / 56** | **1,012 / 0** |
| LP2 pp27–55, 1,439 words | **2,850 / 4,950** | **1,674 / 69** | **1,001 / 2** |
| Original LP1, 694 words | **1,242 / 2,765** | **701 / 637** | **396 / 178** |

The known LP1 first three blocks *alone*, despite being considerably shorter than either LP2 cohort, have **312 aligned pairs with 107 collision pairs; 181 aligned triples with 21; and 104 aligned quadruples with seven**. The LP1 remainder has **930 pairs with 2,369 collisions; 520 triples with 614; and 292 quadruples with 171**. Short native source controls naturally reuse glyph blocks across words, while LP2's word-initial ciphertext blocks are almost completely unique for `b≥3`.

For quantitative context, under independently uniform `29^b` block labels the expected collision count is `N(N−1)/(2·29^b)`. With LP2's original early word-block counts, expected collisions for `b=2,3,4` are **5,008.62, 60.47 and 0.723**; the observed **5,202, 56 and zero** are ordinary at these scales. Source-native LP1 has **2,765, 637 and 178** instead of the uniform **916.36, 10.06 and 0.111**. The normalized collision index `29^b Σ n_i(n_i−1)/[N(N−1)]` for original early LP2 `b=2` is **1.038609**, against LP1 **3.017364**. No stationary bijective mapping of intact complete blocks can change any of those source collision counts.

**Scope:** this excludes a simple fixed 2-, 3- or 4-rune word-reset block-substitution *as a route to ordinary source-style GP29 prose*, regardless of the unknown permutation key, because repeated plaintext blocks would need repeated ciphertext blocks at the exact same word-aligned locations. It does **not** prove that every possible human-authored English text has repeated four-rune prefixes; such a constructed text could avoid them. It does not constrain stateful changing-key block maps, cross-word clocks, transpositions, different plaintext segmentation, arithmetic/range coding or non-GP payload. The source does not tell us to use an arbitrary secret block map in the first place.

## Frozen direct decoder attempted, with complete negative

There is a *possible mathematical bridge* already documented in [the 812-unit correspondence](lp2-dual812-fullring-nonunit-completion.md): original p15's signed matrix has order812; the p39 quadratic defines the dual-number ring GF(29)[ε]/ε² with exactly **812** units; source-linked `g = 19+13ε` generates those units. A complete bijection on the **841** ordered GP29 rune pairs is then:

- For distinct `(x,y)`, form `u=(y−x)+xε`, take `k=log_g(u)`, and emit the two GP29 residues `(floor(k/28), k mod28)`.
- For equal `(x,x)`, emit `(x,28)`; this reserves the 29 nonunits without discarding any original rune.

The earlier complete test used **overlapping** adjacent original pairs and obtained near-uniform registers. The new phase observation permits one distinct **non-overlapping, word-reset** interpretation: pair indices (0,1), (2,3), ... in each *unaltered original printed word*; leave any last unpaired rune intact. This fully specified direct decoder was applied unchanged to every word in every original chapter. The inverse map re-enciphers **all 12,956/12,956 original runes** exactly, including all repeated pairs.

Its actual output is nonlinguistic and retains near-uniform GP29 unigrams. By original chapter, `29×IoC` is:

| Original chapter | Original `29×IoC` | Disjoint word-pair inverse `29×IoC` |
| ---: | ---: | ---: |
| 1 | 0.988393 | 0.997573 |
| 2 | 1.004378 | 1.006281 |
| 3 | 0.999354 | 1.003159 |
| 4 | 1.000556 | 0.998201 |
| 5 | 0.993956 | 1.003034 |
| 6 | 0.991400 | 1.005702 |
| 7 | 0.996441 | 1.000409 |
| 8 | 1.001736 | 1.011733 |
| 9 | 0.980816 | 1.010872 |

The first original p0 word decodes to `EOGAEBMTHOEAE` (GP transliteration), which is not plausible native text. Exact invertibility only proves the arithmetic, while low IoC and unrecognizable complete passages fail this specific proposed plaintext interpretation. Also, the direct within-word difference `C[i]−C[i−1] mod29` has `29×IoC=1.027056` on the first-five-chapter odd steps and `1.018866` on even steps, eliminating a simple *fixed permutation of these step values* as ordinary native-GP plaintext.

## Research meaning and causal next question

A local *positional* asymmetry survives two word-conditioned nulls and a narrow eight-cut familywise comparison; it is worth retaining as a **weak architecture discriminator** when independent source material eventually specifies how pairs, word starts and state are handled. The source does **not** select a GP pair permutation, its key, a nonunit policy as ciphertext semantics, or a rule for switching at the p27 chapter boundary. A complete word-disjoint 812-map, despite the attractive cardinality relation, has already failed against all nine intact source chapters. **Do not fit a different pair alphabet, new clock or arbitrary p27 switch just to exploit this selected statistic.**

The productive successor would be an *independently authored* word-local two-symbol operation with fixed seed/state/key and exceptional-pair policy, followed by blind GP29 decoding of an **intact unknown original paragraph** and exact forward reconstruction. Without that missing authorial selector, archive this narrow positional evidence in `im-results/` rather than promote it to established plaintext or modify the overall conclusion.

**Reproduction:** [source-exact Node22/CommonJS SFT](../sims/lp2_wordlocal_pairphase_chapter_sft.cjs), [manual-only Windows Actions workflow](../.github/workflows/agent2-wordlocal-pairphase-manual.yml), [initial original-input passing run 43778305834](https://github.com/FlareZ123/liber-primus/actions/runs/43778305834), [second source-multiset-control passing run 43778612249](https://github.com/FlareZ123/liber-primus/actions/runs/43778612249).
