# LP2 variable-boundary GP29 SPACE-code capacity gate

**Agent26, 15 November 2026; Director Issue [#973](https://github.com/FlareZ123/liber-primus/issues/973). Classification: a new key-independent, source-register-conditional exclusion of efficient stationary token-codeword inverses. No recovered unknown-page plaintext, historical creator key, or final destination.**

## Why this is a genuinely different decision

The original 2,896 LP2 printed words contain 83 isolated one-rune words using 28 different glyphs. Previously established injective whole-word collision and singleton-capacity results exclude a book/page/line-static decoder **if those printed word breaks are plaintext breaks**. This investigation instead grants the competing hypothesis its strongest advantage: **every printed word separator may be unrelated to the plaintext's word separators**. Genuine plaintext SPACE is a 30th source token alongside the 29 GP runes, explicitly encoded into the 29-symbol printed ciphertext. Punctuation can be carried in a separate unchanged visual channel; no source-printed word length is used to reconstruct plaintext words.

There is no original author instruction selecting a SPACE codec. The useful question is what any simple, lossless, human-implementable symbol/space code would have to do on the untouched original symbols, without fitted words, keys or English scores.

## Exact first-symbol capacity theorem

Suppose each source token, including SPACE, maps to a **fixed, nonempty ciphertext word** of one to L GP29 digits, with no variable padding or deletion. The code can be any lossless uniquely decipherable variable-length token dictionary, including a secret prefix code, and may change independently at physical pages. A fixed secret permutation of the 29 emitted symbols is allowed. A second permitted presentation is one cumulative GP29 layer
\[
C_i=(C_{i-1}+\sigma(D_i))\bmod29,
\]
where \(D_i\) is the code digit, \(\sigma\) is any fixed secret alphabet permutation per scope, and the predecessor is either continuous or the source-fixed zero at a page/chapter reset. In the cumulative case take observed differences \(\Delta_i=(C_i-C_{i-1})\bmod29\).

Each plaintext SPACE starts one disjoint copy of the same nonempty codeword within the scope. Its first emitted digit is therefore the *same* output symbol on each occurrence, even after \(\sigma\). If \(M\) is the greatest observed output-symbol count, the number of genuine plaintext SPACE tokens is at most \(M\). For independently keyed pages, sum the 55 respective maxima. With N output runes, T source tokens and code length at most L, \(T\ge N/L\), hence

\[
\frac{\text{genuine SPACE tokens}}{T}\le\frac{L M}{N}.
\]

The bound uses **neither the printed ciphertext word boundaries nor a guessed plaintext**. It is invariant under all possible stationary 29! substitutions and all possible static space codewords. It does *not* cover token-to-codeword choices driven by position, preceding tokens, unknown state, a nonlinear transducer, genuinely compressed multi-token blocks, filler, or a lost separate side channel.

## Original source counts and plaintext-token density

Source: [original-index LP2 corpus](../resources/liber-primus/lp2-corpus.json), with physical p50 excluded as rune-free. The undisturbed p0–55 output contains **12,956 GP runes** over **55 rune-bearing pages**. Direct output symbols have largest global count **492**. The GP29 first-difference output with a zero starting state has global maximum **510**; even permitting independently chosen SPACE codewords/key alphabets on all 55 pages, the sum of page-local maxima is only **801** (direct raw-glyph equivalent **767**).

A first-party plaintext control is [clear original p57 PARABLE](../resources/liber-primus/lp2-transcription.txt): **95 GP runes**, **20 visible words**, **19 internal word separations**, hence **19/114 = 1/6** SPACE tokens among runes plus SPACE. This is a conditional native-style density benchmark, not proof that unknown LP2 pages have identical word spacing.

| Original output scope and permitted codebook | N GP digits | Maximum M for a SPACE first digit | Max SPACE density if L ≤ 2 | Minimum L if true SPACE density ≥ 1/6 |
| --- | ---: | ---: | ---: | ---: |
| Whole-book, one static codebook, observed GP differences | 12,956 | **510** | **7.8728%** | **5** |
| 55 separately keyed physical-page codebooks, page-reset GP differences | 12,956 | **801** | **12.3649%** | **3** |
| p54–55 final unknown chapter, continuous GP differences | **308** | **20** | **12.9870%** | **3** |
| Independent longer p3–7 chapter, continuous GP differences | **1,145** | **55** | **9.6070%** | **4** |
| Independent p0–2 chapter, continuous GP differences | **729** | **38** | **10.4252%** | **4** |

**Decision:** even an arbitrary secret, page-specific token codebook with every token represented by one or two digits cannot directly restore p57-density GP prose from the unknown manuscript under raw-symbol or cumulative-difference presentation. If the source register has SPACE density ≥1/6, a stationary fixed-codeword system must instead use some unusually long codewords (at least three symbols with independent page keys, five if globally fixed), or introduce a separate changing-state/whitening or multi-token coding stage. The latter can naturally hide SPACE frequency without violating the theorem; it is a genuinely different cryptographic hypothesis.

## Frozen reversible example and attempted original inverse

To make the architecture executable instead of merely counting symbols, freeze a compact prefix-free 30-token GP/SPACE code before reading original ciphertext:

- GP indices 0…26 map to one GP29 step 1…27.
- GP index 27 maps to step 0.
- GP index 28 maps to the two steps [28, 1].
- SPACE token maps to the two steps [28, 2].
- Output \(C_i=(C_{i-1}+\text{step}_i)\bmod29\), initial state 0. Its inverse takes GP29 differences, decodes prefix 28 and rejects any escape suffix other than 1 or 2. Printed spaces carry *no* decoder state. Source punctuation is an out-of-band copied channel.

The actual p57 source tokens (95 rune indices + 19 interword SPACE tokens) encode to **133 ciphertext runes** and recover all **114/114 plaintext tokens** with a uniquely specified inverse. This positive does **not** show that original LP2 uses the code.

Against original ciphertext, the exact frozen inverse becomes undefined at the very first invalid escape and cannot produce a faithful plaintext passage:

| Source-unselected original interval | Runes | Raw occurrences of escape step 28 | Invalid suffixes encountered by frozen scanner | First invalid local rune offset |
| --- | ---: | ---: | ---: | ---: |
| p54–55 complete terminal chapter | **308** | 6 | **5** | **57** |
| p3–7 independent chapter | **1,145** | 43 | **39** | **33** |
| p0–2 additional holdout | **729** | 27 | **25** | **47** |

The scanner consumes the symbol after every encountered escape, including malformed escapes, so its valid+invalid totals can be smaller than the raw escape count when escape-prefix symbols occur consecutively. No shift, fake letter, page-specific key, unknown-F skip, hand-selected exception, or alternative space assignment was optimized after reading these intervals. **This exact frozen two-step scheme fails** on the first contiguous block in every original interval. For the wider family, the key-independent SPACE capacity theorem is the meaningful obstruction.

## Stronger decision: arbitrary secret periodic SPACE codebooks

**New source-original extension, 15 November 2026.** A simple way to evade the global stationary-symbol bound would be to let the entire hidden **30-token codebook change with a public period \(k\)**. Allow a separate secret codebook at *each output-rune phase*, without assuming any entry or Caesar offset, and allow completely independent codebook sets at the original nine visually selected chapters or at all 55 physical rune-bearing pages. Every plaintext token may have a codeword of length one or two runes; the token's codeword is fixed once its **first output-rune position modulo \(k\)** is known. The printed page/word hyphens are irrelevant, and actual plaintext word breaks may occur anywhere. A cumulative GP29 layer is allowed, even with an independently secret GP29 permutation for every phase/scope.

This model has a necessary **first-step capacity invariant** independent of all secret mappings. In a given scope and phase \(r\), every true SPACE begins with the same emitted symbol \(d_{r,\text{SPACE}}\). The number of SPACE tokens beginning at \(r\) is bounded by the *largest observed occurrence count among all 29 output symbols in that phase*, \(M_r\). A model granting independent codebooks over several scopes has at most \(M_k=\sum_{\text{scope}}\sum_{r=0}^{k-1}M_{\text{scope},r}\) SPACE tokens across all scopes. For \(N\) code output runes and at most \(L\) runes per token,
\[
\frac{\#\text{plaintext SPACE}}{\#\text{source tokens}}\ \le\ \frac{L M_k}{N}.
\]
For an additive cumulative wrapper, compute the actual original \((C_i-C_{i-1})\bmod29\) values; for a direct output code use the original printed GP indices. **To avoid assuming any unknown initial state, omit the first printed rune in each independent scope as an arbitrary IV** and count only the remaining \(N\) output positions, with phase zero at the first counted rune. Nothing is normalized or fit on the original glyphs.

The physical page/chapter divisions are fixed by original red rubric and red terminal art, not chosen from statistical scores. Exhaustively enumerate **every integer period \(k=1,\dots,300\)**, asking the one-sided necessary question: *what is the first \(k\) for which the upper SPACE-capacity bound reaches the authentic p57 benchmark \(19/114=1/6\), when the codeword maximum length is two?*

| Original ciphertext scope; secret codebook allowed to differ across each scope | Original coded positions \(N\), after IV(s) omitted | First potentially sufficient output period \(k\), raw GP indices | First potentially sufficient \(k\), cumulative GP differences |
| --- | ---: | ---: | ---: |
| Whole unknown manuscript, one shared secret phased codebook | 12,955 | **164** | **152** |
| Nine source-visible red-heading chapters, independent secret phase codebooks | 12,947 | **20** | **18** |
| Fifty-five original rune-bearing physical pages, independent secret phase codebooks | 12,901 | **4** | **3** |
| Original complete p3–7 chapter | 1,144 | **15** | **12** |
| Original complete terminal p54–55 chapter | 307 | **4** | **3** |

**Independent authentic plaintext-layout benchmark.** The already-solved **p56 AN END** original manuscript has **85 encrypted GP29 runes and 25 authentic known-plaintext words**, hence 24 interword breaks, giving **24/109 = 22.0183%** SPACE-token density. In p56 the printed ciphertext boundaries agree with its known English plaintext; it is a genuine cipher control. The independently solved unencrypted p57 has **95 GP29 runes and 20 words**, giving **19/114 = 16.6667%**. Pool the two original solved pages as independent examples: **180 runes + 43 interword SPACE tokens**, or **43/223 = 19.2825%**. The original pages p0–55 are *not known* to share either plaintext word-density register, so this is explicitly a second conditional benchmark, **not a fact about the hidden plaintext**.

Using the same unchanged ciphertext and the stronger **combined solved-source** spacing benchmark, the corresponding first potentially sufficient phase-period thresholds for maximum-two-digit source tokens become:

| Original unknown scope | Direct GP29 output, period needed for 43/223 | Cumulative GP29 differences, period needed for 43/223 |
| --- | ---: | ---: |
| Whole book shared codebook | **224** | **237** |
| Nine independently keyed original visual chapters | **30** | **27** |
| Fifty-five independently keyed rune-bearing pages | **5** | **5** |
| Independent p3–7 complete chapter | **23** | **21** |
| Original terminal p54–55 chapter | **7** | **7** |

Thus a period-four-or-less two-symbol SPACE codec remains capacity-incompatible even when *all 55 pages have independent phase dictionaries*, **if** LP2's unknown plaintext uses the pooled p56+p57 spacing rate. The shorter p57-only thresholds remain the more conservative benchmark. The [test now checks both original solved pages](../sims/lp2_variableboundary_spacecode_capacity_sft.cjs), the complete 300-period scan and the exact combined thresholds on [Windows Node.js 22 run 43666080470](https://github.com/FlareZ123/liber-primus/actions/runs/43666080470). No unknown key or plaintext is fitted.

The threshold is **necessary, never sufficient**: the period \(k\) at the threshold might still have no valid prefix code, no grammatical plaintext and no independently specified key. Larger periods need not improve the bound monotonically; "first potentially sufficient" means every smaller positive integer period failed under the exact stated source/IV convention.

In particular, for the **nine original visible chapters**, cumulative GP-difference output has \(M_k=762\) for \(k=5\), \(831\) for \(k=7\), and \(1036\) for \(k=16\). On its 12,947 coded rune positions, even the generous \(k=16\) scheme carries at most \(2\times1036/12947\approx16.0037\%\) true SPACE tokens, short of the native p57 **16.6667%**. For a single book codebook, phase-five has \(M_5=552\), only \(2\times552/12955\approx8.5218\%\) capacity. Page-independently keyed schemes with \(k\ge3\) remain unexcluded, as do longer codewords, unknown evolving states, a source register without 1/6 spaces, an unknown compression layer, or a state driven by **plaintext token index** instead of output rune position.

This is the strongest version of the decision: **ordinary p57-density prose cannot be restored from all original p0–55 ciphertext by a one- or two-rune stationary or short-period 5/7/16-phase GP29 token codebook under a globally or chapter-reset public output clock, regardless of the secret per-phase codeword maps**. The original p15 4×4 square, five-dot motif and seven-number hints may suggest periods, but no first-party instruction has been found selecting this token codec or asserting that unknown LP2 has p57-like word spacing. The result is a useful bound on a class of possible changing-state explanations, **not a genuine decipherment**.

**Exact reproducibility:** The single-file [CommonJS source test](../sims/lp2_variableboundary_spacecode_capacity_sft.cjs) now executes the complete \(1\le k\le300\) capacity scan, the independent raw/cumulative GP output cases, all five source scopes, the authentic p56/p57 solved source word inventories, the original p57 full inverse plant, and both disjoint original ciphertext checks. It passed [the original-source Windows Node.js 22 CI run 43665230290](https://github.com/FlareZ123/liber-primus/actions/runs/43665230290). The relevant output object is \`phaseChangingCodebookGate\`, with explicit phase histograms summarized by codebook-scope maximum and the first possible period.

## Scientific scope and next cryptanalytic decision

This is an exclusion of **tokenwise stationary and short-period phase-varying boundary-changing coding** under explicit source-density, output-phase and maximum-codeword-length assumptions. It strengthens the printed-word collision exclusion by giving a direct test for a mechanism that ignores original word breaks entirely. It does **not** establish the plaintext's spacing rate, cipher architecture, original meaning or recovery of any of the 56 unknown pages. The manuscript may have a continuous changing key, a homophonic/stateful transducer, a block encoder, a language register with fewer spaces, or a separate format carrier.

A meaningful successor must supply **a source-selected nonperiodic changing-state SPACE codeword/key state, a genuinely page-local phase/key, or a source-authored block-framing rule**. That is the specific missing input needed to evade this invariant and produce at least 100 continuous original plaintext symbols with disjoint forward checks. Do not fit a free per-symbol escape map or present the p57-density condition as a universal impossibility.

**Reproduction:** [single-file Node22 CommonJS SFT](../sims/lp2_variableboundary_spacecode_capacity_sft.cjs), verified on actual original corpus and native p57 in [Windows manual CI run 43663865107](https://github.com/FlareZ123/liber-primus/actions/runs/43663865107). The script prints all counts and fails on wrong source sizes, an incorrect p57 control, or an invalid planted inverse. No output files or approximate language models.
