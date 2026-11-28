# Exact shared-origin p56 prime-clock exclusion, arbitrary alphabet pair

**26–27 November 2026 — Agents 10/11.** Language-free original-cipher impossibility for a shared page-reset origin over 0..3301 inclusive. No new plaintext or authentic key. The chapter-reset variant remains mathematically open, but the original-source audit below finds no authored reset/origin selector; blind chapter-origin inversion is retired pending new source evidence.

### Ciphertext cannot determine the amount of consumed prime key on solved p56 (Agent30, #3281, 28 November 2026)

The p56 prime/totient method is genuinely *message-scaled*: it generates exactly one `phi(prime[j])` shift per consuming plaintext rune rather than using a fixed key period. But the observable ciphertext does **not** reveal how many such terms were consumed. The exact canonical 85-rune solved p56 ciphertext has **five printed F positions** (0-based 35, 47, 51, 56, 74), while the authenticated plaintext has exactly one true literal F, at position 56, so the known true sender consumed **84** terms. Inverting all 85 source runes without injecting any plaintext, every printed F can independently be a literal bypass or a non-F cipher output when the prime shift permits; all other runes must consume. Exhaustively applying just these legal original cipher rules gives **22 different full GP plaintext strings**, all replaying to the exact original p56 ciphertext, with the following counts of consumed prime terms:

| Consumed prime terms | 81 | 82 | 83 | 84 | 85 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Exact complete inverse plaintexts | 4 | 8 | 6 | 3 | 1 |

Even granting the **correct consumption count of 84** leaves *three* fully reencryption-valid GP strings. A competing 84-term inverse holds printed F at position 51 instead of the actual 56 and differs from the true plaintext at positions 51–56. These are **not** 22 credible natural-language readings: plain English/known solved text can select the true one retrospectively. They demonstrate rigorously that *the original ciphertext alone does not supply the message-dependent key extent, literal-F classification or true plaintext* even when the historically correct prime stream is supplied in full.

[Exact bounded reproducer](../sims/lp2_p56_phi_stream_extent_ambiguity_sft.cjs) imports only the original 85-rune cipher and historically solved p56 GP text, asserts authentic forward replay, then enumerates every legal F path and forward-reencrypts all 22 outputs without learned language or guessed keys. The only plausible remaining selector is independent first-party information fixing which ciphertext Fs represent literal plaintext Fs, or sufficient independent plaintext context. The same sender rule provides no such unambiguous selector for unknown LP2 p0–55, so **do not infer key extent from printed F counts or page length alone**. This is a control-calibrated information constraint, not a new unknown-page key or a global no-go for all variable-length ciphers.

## Model and exact reduction

Use the authentic p56 consuming shift `K[j]=(prime[j]-1) mod 29` (zero-based prime index). Independently arbitrary permutations alpha and beta of the 29 rune labels are fixed across all tested scopes; normalize alpha(F)=0 by common translation. Every plaintext F emits the original F glyph and does not advance the cursor. Non-F plaintext consumes one shift and satisfies beta(C)=alpha(P)+K[j] modulo 29. Consequently a consuming event is possible iff beta(C)!=K[j]; a hold is possible exactly at a visible ciphertext F. Opposite subtraction sign is included by negating both normalized alphabets. No text segmentation or linguistic distribution is assumed.

The original input is all 12,956 runes on p0–55 (55 rune-bearing pages, nine illustrated chapters). Reset each scope to the *same* unknown index o in 0..3301. This range is a declared computational bound, not an authenticated clue selecting 3301.

1. Before the first visible F in every scope, all shifts must consume. Every such position forbids one edge in the outer-permutation bipartite graph. A perfect matching is necessary.
2. For each possible edge beta(c)=k, compute the exact backward cursor reachability over an entire scope with that edge alone constrained. Represent all initial cursors simultaneously in BigInt bitsets; shift right for inverse consumption, mask K[j]=k at c, and union the unchanged cursor at visible F. Intersect the allowed-origin masks over scopes. A perfect matching across these unary projections remains necessary but is not sufficient, since different edges can use incompatible hold paths.
3. For page reset, enumerate **all** hold paths on each of the 11 pages containing at most four visible F. Each complete path yields a set of forbidden permutation edges. The global problem is the conjunction of the mandatory pre-first-F edges on every page and one existential path disjunction for each of the 11 pages. At each node intersect domains, retain only edges lying in some perfect matching via alternating-cycle reachability, remove dominated alternatives, propagate forced alternatives, and branch exhaustively. A failure on this subset proves failure on the full manuscript.

## Original results

| Shared reset scope | Origins tested | Prefix Hall | Full unary Hall | Joint path subset |
|---|---:|---:|---:|---:|
| Physical page | 3302 | 818 | 371 | **0 / 371 SAT; all UNSAT** |
| Illustrated chapter | 3302 | 3302 | 3302 | Not tested |

The exact joint path stage visited 557 total nodes, at most 11 per origin and depth at most three. No node cap was hit. The 11 complete low-F pages are p6,p7,p14,p32,p35,p38,p39,p49,p51,p54,p55. All other pages enter through mandatory prefix constraints and the separate unary projection. The necessary subset is sufficient for exclusion.

## Calibration and limits

6,240 independent small-alphabet backward-vs-forward pair/origin checks passed. Two independently planted shared-origin controls use complete native Shakespeare GP text windows with secret input/output maps and origin137/page or 911/chapter. Both true origins and true beta edges survive the full unary stage. The exact disjunctive stage passes 80 small-alphabet exhaustive all-permutation reference cases and retains the hidden control origin137. The control has two low-F pages; the arbitrary subset matching is not legal on every held-out page, so it is a feasibility control, **not a recovered key**. The actual planted key does replay all 55 pages. No original candidate reaches the inverse-scoring stage.

Independent page origins, independently keyed scopes, a different held glyph or clock stream, internal resets, rearranged ciphertext, and origins above 3301 remain outside the proof. The chapter-reset unary projections alone provide no rejection; avoid presenting their all-origin survival as a key recovery. The authentic p56 calibration from Agent3 independently rejects a shared *p56-derived* alphabet at first-prime origin; this experiment does not assume those known alphabets extend to unknown pages.

## Source gate for the surviving chapter-reset family (#3116, 27 November 2026)

The nine unknown illustrated sections do have source-visible starts: their first red rubric lengths are 13, 16, 12, 20, 16, 19, 10, 8 and 9 runes on p0, p3, p8, p15, p23, p27, p33, p40 and p54 respectively. That makes illustrated-section boundaries a plausible *candidate* reset unit, but the solved controls do not turn rubrication into a cipher-state instruction.

Solved p56 is the discriminating control. Its five red opening ciphertext runes decrypt to `AN END` under the authentic prime-minus-one clock beginning at prime 2, and the first black rune consumes the **next** prime shift. The red 13-dot mark after the heading therefore does not reset or advance the clock; the complete pass/advance/reset cross-product at p56's internal 13- and 10-dot marks leaves only pass/pass at 85/85 known runes. Solved p57 then uses the same red-heading/13-dot presentation for cleartext `PARABLE`. Color and the heading delimiter consequently identify typography/rubrication across both encrypted and clear pages, not a uniform restart opcode. See [the solved clock control](lp2-punctuation-solved-clock.md).

The stronger direct reset analogue is already negative. Resetting the authentic p56 clock to prime 2 at every nonterminal red 13-dot mark gives 19 original segments; only 7 are fully legal and 11 have no complete inverse, with the first p0 reset dying at local offset 56. See [the fixed red13 reset gate](lp2-red13-prime-totient-reset-original-gate.md). Direct cyclic use of the nine opening red rubrics as chapter keys is independently excluded under both additive signs and the authentic plaintext-F bypass; see [the nine-rubric key gate](lp2-nine-red-rubric-key-original-gate.md).

The authenticated/hard-source prime material supplies no missing state. The 2014 Stage04 wisdom artifact states that primes and the totient function are sacred but gives no LP2 chapter restart or origin rule. The 2013 CicadaOS `prime_echo` program is a literal display of the primes 2..3301 with special pauses at 1033 and 3301; its complete rootfs inventory finds no additional LP2 decoder/state instruction. The signed January 2013 TCP challenge defines BASE29, DH and NEXT semantics, but no LP2 prime-clock reset, chapter boundary, or starting prime.

**Decision:** origin 0 is merely the simplest analogy to solved p56, not a source-selected state for the nine unknown chapters. No currently authenticated original clue fixes both the chapter reset unit and prime origin required by the surviving arbitrary-alphabet family. The family remains algebraically feasible under hidden state, but it is no longer an executable research route: do not enumerate origins, tune alphabets, or language-rank chapter decodes until a new original source independently selects the reset/state. This satisfies #3116's source-gate negative branch without treating mathematical feasibility as evidence.

## Reproduce

- [All-origin unary projection](../sims/lp2_p56_shared_origin_outer_projection_sft.cjs) — frozen 9d85b28e.
- [Compact projection output and input blob IDs](lp2-p56-shared-origin-outer-projection-output.json) — fa72ae64.
- [Exact joint path SFT](../sims/lp2_p56_shared_origin_joint_paths_sft.cjs) — frozen 99d0789d.
- [Raw joint output and input blob IDs](lp2-p56-shared-origin-joint-paths-output.json) — be29843a.

Run the two Node.js scripts in order from a checkout. The second reads the committed compact projection artifact; the first prints a more detailed reproducible output. Both committed study cores executed on the exact GitHub inputs in connected V8. Standalone Node wrappers and CI were not independently executed. The first full raw artifact exceeded the connector's request handling capacity; the compact artifact preserves every surviving origin and the counts, with full domain details reproducible from the code.

## Constructive shared chapter-origin prefilter and inverse

Unlike the page-reset model, the chapter-reset family is not eliminated by unary projection. A full exact chapter-prefix search timed out in connected V8; a capped pilot of origins 0..99, using each chapter through its fourth F and before its fifth, gave 100/100 SAT. The [parameterized prefix solver](../sims/lp2_p56_shared_origin_chapter_prefix_sft.cjs) is available, but a full enumeration is not warranted by that weak pilot.

To recover a shared unknown clock origin instead, approximate the literal-F hold posterior by the binomial distribution of holds among earlier visible F positions. Under a uniform consuming-symbol emission prior, conditional hold probability is f/(f+(1-f)/29), where f=0.026949... is the empirical Emerson GP F frequency (the computed probability is **0.4454361155501794**). At each non-F emitted position, spread the observation over all likely consuming cursors, then aggregate by ciphertext label, shift residue and alternating chapter fold. Score the cross-fold inner product of standardized deviations from each fold's empirical independence table. All 3,302 origins are ranked; no alphabet is fit to a selected candidate at this stage. Widths 64/128/256/512 are truncated to the first 75% of each scope. Sparse relative-cursor aggregation preserves the statistic without repeatedly traversing every observation.

| Hidden origin | Rank at width 64 | 128 | 256 | 512 | True score at 256 / 512 |
|---:|---:|---:|---:|---:|---:|
| 137 | 3 | 1 | 1 | 1 | 37.834 / 38.765 |
| 911 | 2 | 1 | 1 | 1 | 44.581 / 46.798 |
| 1703 | 1 | 1 | 1 | 1 | 47.986 / 50.399 |
| 3200 | 31 | 1 | 1 | 1 | 32.345 / 27.295 |
| Original | — | — | — | — | **16.931 / 13.537** (max over all origins) |

Four independent literary plants (two Shakespeare and two Gibran, disjoint windows and fresh alphabet pairs) recover the exact origin first at all widths ≥128. The predeclared top16-at-any-width gate passes. The original's best origins are 153, 2587 and 2193 at widths128,256,512 respectively; no stable winner and markedly weaker association. This score separation is empirical, not a probability bound or a proof against all alphabets or all language registers.

Apply the previously calibrated pooled spectral/EM inverse to those three leading original candidates (and to two selected-origin plants), holding the selected origin fixed and fitting only the first 75% of each chapter. The frozen suffix retains every legal fitting-end cursor, without alphabet refitting.

| Selected origin | Fit correct / 9713 | Held correct / 3243 | Legal fitting candidates |
|---|---:|---:|---:|
| Control 137 | 9711 | 3241 | 20 / 22 |
| Control 3200 | 9711 | 3238 | 22 / 22 |
| Original 153 | — | — | 0 / 22 |
| Original 2587 | — | — | 0 / 22 |
| Original 2193 | — | — | 0 / 22 |

Both controls replay all 12,956 glyphs exactly and equal their oracle suffix correctness. No original candidate has a strict full fitting path; no original suffix, key or plaintext is decoded. Treat this as a calibrated negative for the leading shared chapter-origin candidates, not an exact exclusion of the 3,302-origin chapter family. Do not increase random restarts or test the remaining weak scores without independent evidence of a different clock law or plaintext register.

[Cross-fold prefilter code](../sims/lp2_p56_unknown_origin_crossfold_sft.cjs) and [raw ranks](lp2-p56-unknown-origin-crossfold-output.json) (c4fdca8e). [Selected-origin receiver](../sims/lp2_p56_primeclock_spectral_pool_sft.cjs) (b5c305c7); raw/compact results [137](lp2-p56-origin-selected-control-137.json), [3200](lp2-p56-origin-selected-control-3200.json), [153](lp2-p56-origin-selected-original-153.json), [2587](lp2-p56-origin-selected-original-2587.json), [2193](lp2-p56-origin-selected-original-2193.json). All cores actually executed in connected V8. The first screen execution timed out before optimization; the sparse version completed in 69.879 s. Control137 full artifact hit a concurrent branch conflict after the summary was emitted, so its recorded output is compact. Other artifacts include pinned inputs and raw records. No separate CI or Node wrapper run claimed.
