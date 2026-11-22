# Final LP2 section: source-derived 829-block and sixteen-page square/grid key inversions

**10 November 2026, Agent 45. Supporting original-cipher evidence, not newly recovered LP2 plaintext.** The keyless and keyed tests below are finite original-source challenges. The strongest result is an **exact exclusion of eight page-local Fibonacci-square prime-totient schedules and a further 88 independent grid/square AES or ChaCha key constructions** under the *same selective literal-F transducer that exactly decrypts solved physical p56*. These cryptographic impossibilities require **no original-plaintext language assumption**. The original last-section 829-block geometry additionally fails a complete source-square Hill cross-block inversion, even with all 24 assignments and four matrix orientations, against every contiguous native-GP Shakespeare reference window. The direct-score AES grid tests remain separately bounded negatives. Nothing here identifies an authentic key, new plaintext, hidden-service URL or destination.

## Unexploited source geometry

The final dollar-delimited LP2 section, starting on original physical p40 and ending on p55, has **3,316 consecutive original GP runes** spanning **sixteen physical pages p40–p55**, of which numeric-only p50 has zero runes. The original p15 four-by-four square contains exactly **16** printed numbers; one of its sixteen indexed primes is **829**, the **145th prime**, corresponding to printed value **2472 = 3301−829**. Therefore the last section has exactly **4×829 runes**. Independent original p49–p51 contain exactly **256** base-60 decoded bytes, which also group as **16×16 byte keys** if each of the last sixteen pages receives one AES-128 key.

These are **retrospectively noticed count coincidences**. No plaintext or specification of the intended cipher follows from them; their rarity has not been calibrated over all possible manuscripts, section boundaries, grids, primes or block sizes. They warrant source-frozen direct tests rather than a cryptographic discovery claim. The square's exact Fibonacci formula was established by prior Cicada researchers and is documented in [the project synthesis](../results/fibonacci-prime-spiral.md).

## Exact keyless control: no shared four-block additive pad

Split the last section into four fixed contiguous blocks of 829 source runes. Align their six unordered pairs and compare symbol equality under any common additive GP29 pad. The raw equalities out of 829 are **34, 28, 37, 26, 33 and 25**, totaling **183 of 4,974 = 0.0367913**. In 2,000 seeded independent circular rotations of the *same four original blocks*, **379** controls have at least as many pooled equalities (null mean 171.324). Permit each block pair its own unspecified Caesar delta by taking the maximum of each pair's 29 difference bins: observed sum **236**; random circular rotation mean **240.046**, **1,476** controls at least as large. Thus the specific hypothesis of one four-block shared additive pad, even with per-block constant shifts, has no supporting cross-block phase signal. This does not exclude four unrelated keys, key skips or nonlinear encipherment.

## Four independently initialized AES/ChaCha streams on four 829-rune blocks

[Reproducer](../sims/fibonacci829_fourrow_source_inverse.cjs) forms each 32-byte key as SHA-256 of four unsigned 16-bit p15 values; it allows source square rows, columns, and four successive outward spiral quartets; big/little-endian serialization, AES-256-CTR/ChaCha20, two rune-byte reductions and two signs. **48 exact settings**. Select by unigram GP-English likelihood on only the first **829** original runes. The best training key is p15 printed rows, big-endian, AES-256-CTR, mod29, sign−, but its untouched **2,487-rune** GP index of coincidence is **0.0345054137**, near the uniform-rune **1/29≈0.0344827586**. Training and continuation log-likelihoods per rune are **−4.022393** and **−4.175399**, respectively, against an independently English-encrypted true-key control of approximately **−2.99157** and **−3.01347**. The blind fitting algorithm ranks the correct hidden source model **1/48** and recovers the planted **3,316/3,316** runes, verifying discrimination within the declared family. [Successful manual CI run 42854714375](https://github.com/FlareZ123/liber-primus/actions/runs/42854714375).

## Sixteen physical AES-128 grid keys with square-derived nonce starts

[Reproducer](../sims/final16_grid_square_pagekeys.cjs) partitions the authentic corrected 256-byte grid into sixteen sequential 16-byte AES-128 keys, in row-major or column-major byte order; initializes per-page AES-128-CTR with all-zero IV or one of four explicit 16-bit square-value/prime-complement IV sequences; and maps each byte to GP29 via remainder/scaling under two signs. This is **2×5×2×2=40** fully source-specified models, applied to **physical p40–p55**, retaining p50's empty text key. Train exclusively on original p40–p43 (**1,050 runes**), freeze the same construction for p44–p55 (**2,266 runes**).

The best training model (row-major keys, prime-complement IV from printed square, byte mod29, sign−) scores **−4.076117** GP unigram LL/rune on training and **−4.130166** on heldout, with heldout IoC **0.0345091759**. Exact known-source AES-GP English plant selects the correct secret key layout and IV from the 40 hypotheses at rank **1**, recovers **3,316/3,316** known runes and has heldout IoC **0.05661969**. This candidate family therefore does not yield readable original text under its direct 29-ary mapping. [Successful manual CI run 42855455198](https://github.com/FlareZ123/liber-primus/actions/runs/42855455198).

## Exact selective-F prime-totient exclusion on all sixteen pages

The authentic cipher of solved physical LP2 **p56** is additive GP29 prime-totient with **zero-based start prime ordinal 0**, sign− on decryption, and the *selective* literal-F rule: the only plaintext F at page-local position **56** produces ciphertext F and **does not consume a prime**. Other displayed cipher-F runes are ordinary encrypted letters and **do consume a prime**. This prevents the common error of treating **all** visible F as skips.

A source-fixed extension maps each of physical pages **p40–p55** to one of the sixteen original square cells by printed-row-major or outward-spiral order, and uses the source cell's printed value or the corresponding prime complement `abs(3301−value)` as the **0-based initial prime ordinal**. Every non-F plaintext rune emits `C=P−sign·(prime_{ordinal+1}−1) mod29` and advances the prime clock. Every plaintext GP F **must** instead emit literal cipher F (index 0) and must **not** advance the clock. Decryption admits any selection of the observed cipher-F locations as the literal-F subset; it is exhaustive over those choices through a Viterbi DP, without preselecting or guessing their positions. The **eight settings** comprise two square reading orders, two start conventions and two cipher signs; every page resets its clock.

A crucial *language-independent necessary condition* is that each nonzero observed ciphertext rune must correspond to a **nonzero** plaintext rune under the hypothesized key clock. For every possible selective-F mask, each of the eight source-frozen settings encounters a nonzero ciphertext output whose only putative normal plaintext is F. Such an event cannot be produced by the stated reversible encoder. **All eight models already become impossible on original p40 alone.** Earliest page-40 impossible zero-based rune offsets:

| Square order / ordinal root | Sign − | Sign + |
| --- | ---: | ---: |
| Printed row-major / printed cell value | **31** | **79** |
| Printed row-major / 3301 prime complement | **18** | **63** |
| Outward spiral / printed cell value | **21** | **14** |
| Outward spiral / 3301 prime complement | **59** | **13** |

Further impossible events occur on almost every later page. This is an **exact finite original-input exclusion independent of the GP language model**. The English bigram scorer is used only to choose between surviving possible mask paths when such paths exist.

Two independent power checks run through the *same* script:

- On **authentic solved p56**, the source GP spelling, ciphertext, start-prime ordinal zero, sign− and known literal-F position 56 round-trip **85/85**; the blind Viterbi additionally **recovers 85/85 original runes** and independently locates the single literal-F at **56**.
- On a fresh source-disjoint **3,316-rune** GP-English passage encrypted using the hidden printed-row-major p15 value per physical-page prime start, the exhaustive eight-way selection ranks the genuine key at **1/8**, and the inferred plaintext recovers **3,314/3,316 GP runes** from the hidden F masks while its true known mask exact forward-round-trips all 3,316. The two ambiguous errors are a limitation of the language prior rather than cryptographic noninvertibility with known mask.

[Exact solved/unknown input source and inverse](../sims/final16_fibonacci_totient_fmask.cjs) · [successful manual GitHub Actions run 42856960766](https://github.com/FlareZ123/liber-primus/actions/runs/42856960766). The selective-F inverse is strictly stronger than merely observing low IoC after a guessed prime pad: no choice of the unknown F-skip mask can produce the original source under any of the eight declared starts/signs.

## Exact 88-model transparent-F gate over source-derived binary keystreams

The selective-F model above has an additional powerful necessary condition independent of the cipher *family*: any deterministic byte-keystream GP29 additive transform, equipped with plaintext-F→literal-cipher-F and no consumed key at F, must have **at least one feasible schedule of secret F skips** on the original ciphertext. There is no GP language assumption. The [new reusable source-key gate](../sims/final16_transparent_f_gate.cjs) propagates **all reachable key-byte clocks** simultaneously after every original GP rune, adding a no-key-advance branch at every observed cipher-F and forbidding a key-consuming branch whenever its predicted plaintext would itself be F.

Apply this exact finite mechanism to the same **40** source-frozen per-page AES-128 grid/square candidate keys and **48** four-by-829 AES-256/ChaCha20 square-derived keys tested above. The page case resets one byte stream at each original physical page, retaining the empty p50; the block case resets at each of four contiguous 829-rune section blocks. Crucially, the test allows *every possible* visible-F mask and therefore subsumes the earlier fixed-key-index reading if the true cipher really follows the solved-page F rule.

| Original source family, exact key clock | Key candidates | Fully feasible on original | Smallest number of individually impossible original units |
| --- | ---: | ---: | ---: |
| Grid-derived AES-128 CTR, physical page reset, square IVs | **40** | **0** | **12 of 15** rune-bearing pages |
| Square-derived AES-256 CTR/ChaCha20, four 829-rune resets | **48** | **0** | **4 of 4** blocks |
| **Combined** | **88** | **0** | Every key model fails |

For example, the page-key model using 16 row-major AES-128 keys, zero IV, `byte%29`, sign− is impossible already at p40 offset **4**, and fails on fourteen of fifteen original rune-bearing pages. The first-block AES-256-CTR source-row big-endian key with the same reduction/sign becomes impossible at original block offset **65** and separately fails in all four blocks. No inferred English score is needed for either conclusion.

To establish that rejection is not an artifact of the dynamic program, the script independently encodes **3,316 native GP-English control runes** under the page-key model, and a second source-disjoint arrangement under the four-block key model. Both positive controls are exact source-law encryptions, with **70 plaintext F interrupters** in the tested source; the same exhaustive decoder verifies **all 3,316 symbols feasible** in both planted controls. This tests the declared feasibility invariant and key-clock branching, without asserting which branch is the historical choice.

[Successful manual GitHub Actions run 42857899474](https://github.com/FlareZ123/liber-primus/actions/runs/42857899474) records every candidate's first impossible original coordinate and the two successful source-controlled plants. The result is a complete, language-free exclusion of **these 88 specific source-derived direct GP29 key schedules conditioned on the authentic solved-p56 interrupter law**. It does not exclude an AES/ChaCha intermediate with an unknown cipher layer, different page/byte clock registration, alternate F handling, output repair or independent secret keys.

## Source-locked 4×829 cross-block Hill inverse

The same source relation suggests a distinct operation absent from the direct pad and AES tests: use the printed p15 **4×4 Fibonacci-prime square itself as a mixing matrix** across four *simultaneously aligned* 829-rune parts of the last LP2 section. This differs from applying a four-symbol Hill transform to consecutive local runes. Reduce the sixteen printed integers modulo 29; the source matrix and its inverse are

    M = [[10,3,20,22], [1,22,21,25], [11,17,19,7], [21,17,12,22]]
    M^-1 = [[19,1,6,3], [11,7,8,22], [2,10,15,28], [25,4,1,15]].

At each column t (0–828), read exactly one original GP ciphertext index from each of four consecutive 829-rune blocks, multiply the four-entry vector over F29 by a declared source matrix, then concatenate the four output streams. The exhaustive original-cipher matrix family permits the printed matrix, its inverse, the transpose or the inverse transpose, **and all 4! physical-block assignments**, giving **96 exact models**. Reversing time within a whole output block or using any additional *fixed* 29-symbol output permutation cannot alter a block's symbol-collision IoC, so they cannot evade the ensuing direct-English statistic.

The resulting **384** original decoded 829-rune blocks have IoC **0.03371444555–0.03543061601**. The maximum, even after all 96 source-motivated models, occurs with the inverse transpose and block assignment **[1,3,2,0]**, and is **0.03543061601487153**. For comparison, independently transcribe the checked-in 300,000-character Shakespeare reference into **218,800 canonical GP runes**, including the multigraph tokens; every one of its **217,972 overlapping 829-rune windows** has IoC at least **0.05303228964528592**. Exactly **0/384** original decoded block outputs reach even this reference-window floor. Each matrix/output GP alphabet permutation is a bijection, so relabelling recovered symbols cannot change the bound. This is a finite source-reference-specific exclusion of *direct native-GP-English output* under these four exact source matrices and 24 ciphertext-block assignments; another language, non-GP intermediary, word repartitioning with a new transform, or evolving matrix remains outside scope.

A deliberately hidden source-encrypted control assembles **3,316** real Shakespeare GP symbols into four 829-rune plaintext streams, encrypts by the printed M over F29, and hides the row assignment as **[2,0,3,1]**. The exact inverse with the matching hidden assignment recovers **3,316/3,316** runes. Its four authentic source-block IoCs are **0.06322442, 0.06463465, 0.06225416, 0.06239693**, all above the fixed reference minimum. This proves the original negative is not a synthetic-transformation implementation failure; it does not authenticate M as the true LP2 key.

[Reproducer: exact 96-model original and source-native control](../sims/fibonacci829_crossblock_hill_gate.cjs). Node 22, CommonJS, source files read without modification. The scoped result retires this *direct* cross-block Hill interpretation of the printed p15 square. No new key, plaintext, or target is recovered.

## Boundaries and next source clue required

These tests exclude a shared four-block pad phase, a direct four-block 4×4 source-Hill mixer against the stated native-GP reference, and four source-frozen keyed architectural families in their specified direct forms. They do **not** exclude a hidden binary intermediate, grid-key transposition, additional byte transformations, non-page resets, non-source-aligned starts, cipher-repair steps, or a mixed alphabet. In particular, the selective-F exclusion assumes the **same pure interrupter law as solved p56** extends to these pages and that the page clock starts exactly at its square-selected ordinal. If either assumption fails, the impossibility ceases to apply.

The useful next attack needs an original clue predicting which **non-page-aligned clock or key-state** is actually used, or whether a first encryption layer explains the unusually uniform ciphertext before any GP prose appears. Further ad hoc shifts/seed lists on the same eight rejected schedules will not unlock the manuscript.

All four keyed analyses are available in the existing **manual-only** [grid/square cross-clue workflow](../.github/workflows/grid-square-iv-keys.yml), run on Node.js 22 with original repo sources and a source-disjoint English control. Do not promote this note to a recovered decryption in `results/README.md`.
