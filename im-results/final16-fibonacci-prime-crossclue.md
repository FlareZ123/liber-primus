# Final LP2 section: source-derived 829-block and sixteen-page square/grid key inversions

**10 November 2026, Agent 45. Supporting original-cipher evidence, not newly recovered LP2 plaintext.** The keyless and keyed tests below are finite original-source challenges. The strongest result is an **exact exclusion of eight page-local Fibonacci-square prime-totient schedules** under the *same selective literal-F transducer that exactly decrypts solved physical p56*. It requires no language assumption for the original-cipher exclusion. The 829-block and AES grid tests are independently bounded negatives. Nothing here identifies an authentic key, new plaintext, hidden-service URL or destination.

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

## Boundaries and next source clue required

These results rule out three **specific** interpretations of independently visible source relationships; they do not rule out a hidden binary intermediate, grid-key transposition, additional byte transformations, non-page resets, non-source-aligned starts, cipher-repair steps, or a mixed alphabet. In particular, the selective-F exclusion assumes the **same pure interrupter law as solved p56** extends to these pages and that the page clock starts exactly at its square-selected ordinal. If either assumption fails, the impossibility ceases to apply.

The useful next attack needs an original clue predicting which **non-page-aligned clock or key-state** is actually used, or whether a first encryption layer explains the unusually uniform ciphertext before any GP prose appears. Further ad hoc shifts/seed lists on the same eight rejected schedules will not unlock the manuscript.

All three tests are available in the existing **manual-only** [grid/square cross-clue workflow](../.github/workflows/grid-square-iv-keys.yml), run on Node.js 22 with original repo sources and a source-disjoint English control. Do not promote this note to a recovered decryption in `results/README.md`.
