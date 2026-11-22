# Twice-shed p50 28×4 core: authentic geometry and a four-state cipher capacity limit

**Evidence:** Original-source 32×8 table geometry and exact, key-independent GP29 frequency-capacity theorem. Agent8 established the geometry in Director #1641 (18 November 2026); Agent6 added the original-cipher four-phase capacity test on 22 November 2026. **No unknown LP2 plaintext, genuine payload key, complete decoder, or destination is recovered.**

## Original cue and the surviving geometric object

The signed 2013 DH worked example and the manuscript's clear p57 circumferences invite a **conditional** interpretation of the recovered DH shared value **2**: peel the complete outer circumference of the source 32×8 numerical table twice. This leaves printed rows **2–29**, columns **2–5**, a literal **28×4 = 112-cell** core, with **60** circumference cells. The conditional DH table addresses **186** and **189** occupy opposite side edges of the inner ring; their shorter ring distance **15** reconstructs the worked-example client exponent. This geometry is reproducible from original source. Neither the signed DH exchange nor the manuscript authenticates an associated payload codec.

A potentially usable cipher mechanism follows directly from the shape: a GP29 ciphertext has **28 nonzero predecessor differences**; the core contains **28 rows and four columns**. One could interpret the rows as a delta-state alphabet and the columns as a rotating four-phase decoder. This is a source-motivated hypothesis, not a known author-selected cipher. Before choosing cell radix, direction, secret row assignment, or rune keys, test whether **any** reversible, one-GP-symbol-per-difference four-phase lookup can recover source-like prose at all.

## Exact all-key necessary condition

For every original rune-bearing physical page p and every local rune index i after its first, set its observed difference to **d = (C[i] − C[i−1]) mod 29**. Permit **each physical page its own four completely secret, unrelated GP29 bijections**, one at each phase i mod4, giving hypothetical plaintext **P[i] = f(page, i mod4, d)**. Every source page's first rune is unconstrained. This model includes all possible fixed row orderings, hidden GP29 relabelings, byte-rank mappings, signs, and literal four-column substitution tables operating on the difference tape; it is much more permissive than using specific p50 numerical values.

An arbitrary bijection assigns at most **one input difference class** to a chosen plaintext symbol at each page/phase. For the k most frequent plaintext rune symbols, the maximum count is exactly bounded by the sum of the **k largest observed difference-bin counts** in every page/phase, plus one unrestricted first rune for every physical page. This is a necessary condition over **all secret permutations**, and requires no key or plaintext search.

A still more permissive variant uses the manuscript's actual [ink and punctuation annotations](../resources/liber-primus/lp2-ink-annotations.json). Start a new completely independent set of four secret codebooks at each original **red-rune span start/end or large 10/13/23-dot punctuation**, as well as each page boundary. Deduplication yields **77 original-source segments**, including **22 additional internal cuts** beyond the 55 rune-bearing pages. We freely assign the first rune in each segment, and no difference across a cut is charged. All 12,956 ciphertext runes remain included.

| Maximum number of any fixed set of k decoded GP29 symbols | k=1 | k=2 | k=3 | k=4 | k=5 | k=8 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| All-secret four-phase, **55 independent page codebooks** | **1,243** | 2,250 | 3,146 | 3,975 | 4,740 | 6,732 |
| All-secret four-phase, **77 independently rekeyed marked segments** | **1,361** | **2,428** | **3,359** | **4,196** | **4,966** | **6,964** |

These are rigorous upper bounds directly computed from the 55 original page tapes. With page-only rekeying, letting the phase period vary between one and five states gives top-one upper bounds **856, 1,018, 1,150, 1,243, 1,380**, respectively. This additional five-phase bound does not grant arbitrary rekeying at the 22 extra image-annotated cuts.

## Native-GP plaintext comparisons

Use independently pinned historical/literary GP29 controls. For each reference, slide a complete **12,956-rune** window over its native transcript, recording the **minimum** largest one, two and five plaintext rune counts across **every** possible window; no reference window is selected to improve an original-cipher comparison. The English references use the pinned modern English GP transliteration. The corrected Old English *Beowulf* and Latin Vulgate controls use their separately pinned, source-native GP29 symbol streams.

| Reference control | Complete native windows | Minimum most-frequent one rune | Minimum top two | Minimum top five |
| --- | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet* | 50,159 | **1,407** | 2,556 | 5,274 |
| Emerson, essays | 311,675 | **1,482** | 2,514 | 5,407 |
| Shakespeare | 205,845 | **1,397** | 2,459 | 5,138 |
| Corrected Old English *Beowulf* | 35,057 | **1,477** | 2,560 | 5,130 |
| Latin Vulgate New Testament | 191,847 | **1,465** | 2,837 | 6,319 |
| **Original LP2 max with arbitrary image-mark rekeys** | source ceiling | **1,361** | **2,428** | **4,966** |

**Every one of the 794,583 control windows exceeds the most generous original-source four-phase capacity at top-one**; all five independent registers also exceed the bounds at top-two through top-eight. The weakest top-one margin is **36 runes**, against Shakespeare. The Latin comparison uses its most frequent *GP rune*, not Latin E specifically. This makes the exclusion independent of whether the English letter E is unusually common. The result does not rule out all naturally conceivable languages or exceptionally flat intentional writing; it excludes the five declared native registers and every tested window from them.

All-genuine-positive controls reverse a 12,956-rune native-GP passage exactly after deliberately encrypting it with **new arbitrary bijections for every phase of all 55 pages and all 77 annotated segments**, verifying each original word-length-shaped page partition, every ciphertext step, and every plaintext rune. The original input fails where an actual member of the tested cipher family passes.

The [standalone CommonJS reproducer](../sims/lp2_p50_twoshed_fourphase_allsecret_capacity_sft.cjs) uses immutable canonical corpus, image annotations and five source-native literary controls; all eight top-k source envelopes, five page-period ceilings and full positive inversions are asserted. It passed [Windows Node22 manual run 44998900820](https://github.com/FlareZ123/liber-primus/actions/runs/44998900820). No secret row map or table-value tuning is performed.

## Remaining receiver obstacle

The numeric table still supplies **112 digits after two conditional circumference peels**, but no original LP2 page has 112 runes and the 2013 source does not specify a 112-byte consumer. The once-shed 30×6 interior has **180 cells**, exactly matching solved p56+p57's 85+95 runes, yet direct prescribed byte-to-GP interpretations conflict with the known solved text under the separately recorded source test. Conventional base60 parses the original printed table into bytes, while the p27-local pointer circuit prefers base59 on some cells; neither constitutes an authenticated entire-core serialization.

The signed DH packet supplies a small integer exchange ending at **03 DATA k**, and its signed NEXT transcript accepts client plaintext lines; neither provides a KDF, payload encryption transform, nonce, IV, authentication tag, or the missing rune/byte mapping. The genuine 2013 Instar byte-XOR precedent lacks a second 112-byte source operand. The p56 prime/totient cipher is authenticated for one solved GP29 stream, with an explicit transparent-F behavior, and does not specify the core's prime start or symbol register. The signed BASE29 converter is a scalar integer codec, not a block cipher.

**Decision:** Retain the twice-shed 28×4 geometry as a conditional navigation object. Retire all stationary four-phase **bijective** predecessor-difference lookup decoders over the full original GP stream, **even when a new completely secret set of four codebooks is granted at every source-visible image-annotated boundary**, for the five tested native plaintext registers. Any actual four-column cipher capable of ordinary GP29 prose would require another mechanism: context-dependent codebooks within marked segments, a nonbijective or variable-length register, an external running key, different word/rune ordering, or plaintext outside the five controls. Further direct numeric-table tuning is lower priority until an independently source-selected consumer identifies an output alphabet, an inverse operation, and a target span.

Earlier evidence and routes: [DH shared2 geometry](lp2-p27-dh23-shared2-circumference-client-secret.md), [p27 operation gate](lp2-p27-find-divinity-operation-gate.md), [original table layout](lp2-p49-p51-rowmajor-source-layout-gate.md), [outer76/inner180 typed comparison](../sims/lp2_32x8_outer76_p55_instar_source_gate_sft.cjs), and [separate word-local homophonic difference bound](lp2-diff-wordphase-homophonic-information-bound.md).
