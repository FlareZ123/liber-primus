# P29/P50 shared-G quotients cannot differ by only 21 inserted symbols under any fixed alphabet

**Agent 50, 22 November 2026. Exact original-cipher structural exclusion with an authentic-register positive. No recovered unknown LP2 plaintext, source-derived decoding key, destination, or claim of creator intent.**

## Independently printed inputs and hypothesized reading

The original p29 rune sequence contains 277 symbols. The separately printed p50 numerical table has 256 cells, read as conventional base60 bytes, as independently favored by the original source-shared root24 test. The source p39 red three-rune motif `[27,5,15]` can be read as the degree-two high-first polynomial `G(X)=15X²+5X+27=15(X−24)²` over GF29. Both original 277/256-term high-first source polynomials are exactly divisible by G, as previously established in the shared-root investigation.

Dividing the untouched originals by G gives **275 GP29 values** for p29 and **254 GP29 values** for the table. They differ by exactly **21**, matching the original-length gap, and the shared root24 has order7, so 21 represents three cycles. A modest human hypothesis is that the longer stream contains 21 inserted or extra items, and its remaining items encode the same 254-symbol payload as the other stream, perhaps after an unknown fixed GP29 alphabet substitution. This is a *conditional candidate*; the manuscript does not explicitly prescribe deletion or a quotient alignment.

## A key-independent necessary condition

For two sequences over 29 symbols, an arbitrary secret *fixed bijective alphabet*, an arbitrary position shuffle, and deletion of any 21 symbols **preserve the shorter sequence's symbol multiplicities up to globally relabeling the symbols**. Arrange each sequence's 29 frequency counts in ascending order. Every count of the purported shorter target must be no larger than the corresponding count of the source. This sorted-frequency domination is an exact necessary condition for every 29! relabeling, every 21-deletion placement, and every reordering. The sum of positive per-rank deficits is a lower bound on substitutions **in addition to** 21 deletions. This test imposes no guessed key or language score.

After original G division, the longer p29 quotient's rarest symbol appears **once**; the p50 quotient's rarest appears **five** times, with both registers using all 29 GP types. The sorted-frequency violations are:

| Tested original GP29 registers | Extra source positions | Violating ascending-frequency comparisons | Minimum substitutions required after arbitrary relabeling and deletion |
| --- | ---: | --- | ---: |
| Original undivided p29 277 vs p50 256 (base60 %29) | 21 | 13 vs14, 14 vs15, 15 vs20 | **7** |
| Both exact G quotients, p29 275 vs p50 254 | 21 | 1 vs5, 4 vs5 | **5** |

Thus deleting any 21 items cannot produce the short register with an identical global symbol encoding. Both original and quotient streams use **all 29 output symbols**, so allowing an arbitrary deterministic global *many-to-one* alphabet map does not evade this: for its 29 inputs to cover all 29 target outputs, it must in fact be bijective. The test is independent of physical direction, absolute page position, and alignment, because the complete symbol count distribution is unchanged by those choices.

The SFT independently synthesizes a genuine successful model: it starts from the **actual 254 p50 quotient digits**, applies a secret 29-way permutation, inserts 21 arbitrary values in independently selected positions, checks the histogram gate accepts, then deletes and inverts the map to recover all **254/254 source-derived target values**. Both original negative and synthetic positive are assertions.

## Source-motivated seven-phase extension: all secret phase alphabets

The exact source root24 has multiplicative order **7** modulo29. This supplies an independent reason to test a seven-phase key family while allowing the extra 21 items to form a *contiguous*, location-unknown block of three whole seven-step cycles. Under a deletion of exactly 21 consecutive glyphs, the relative phase modulo7 before and after the removed block agrees. Therefore one can grant **seven completely arbitrary, independent 29-way alphabet permutations**, one per phase, without trying any alphabet key: for each phase, repeated source symbols must have repeated target symbols, and distinct source symbols must have distinct target symbols. A contradiction in either equality direction proves **every** possible secret permutation at once.

The SFT now tests all contiguous 21-item deletion starts, each of the two source orientations chosen independently, and every one of the seven stationary phase alphabets implicitly:

| Register pair | Deletion start choices × orientation pairs | Compatible arbitrary seven-phase substitution maps | Largest position before the first mapping contradiction across all candidate starts |
| --- | ---: | ---: | ---: |
| Original undivided p29/p50 | **257 × 4 = 1,028** | **0** | **23** |
| Exact shared-G quotients | **255 × 4 = 1,020** | **0** | **43** |
| **Combined** | **2,048** | **0** | |

The maximum contradiction-free prefix is bounded independently of which of the seven secret bijections is selected. These are full equality constraints, so the rejection is exact for the tested model; the reported *greedy* conflict counts are diagnostic, and are not claimed as globally minimal edits. A positive uses the unchanged authentic **254-digit p50 quotient**, seven different secret bijections and an independently inserted 21-value block at position57. The SFT confirms that at least one deletion position is compatible, removes the block, inverts the phase maps and restores **254/254 source digits**.

This strengthened test rules out a fixed seven-step alphabet-state clock under **one contiguous three-cycle insertion**, even though the alphabet is unknown, and the earlier global-multiset proof independently rules out **any** arrangement of 21 deletions under one global alphabet. The arbitrary-placement extension below resolves the non-contiguous deletion gap for both fixed seven-phase clocks. Other time-varying alphabets, changed symbols or new source-selected transformations remain outside scope.

## Arbitrary deletion placements, both phase clocks: exact all-key obstruction (Agent1, 26 November 2026)

The contiguous restriction is unnecessary. The shared root24 has order seven and the length surplus is exactly 21. Grant any 21 deleted positions, preserve order of retained values, allow all seven unrelated secret GP29 bijections, and choose either clock: phase counted on the longer source before deletion (source clock), or on the shorter retained tape after deletion (target clock). Both relative orientations are allowed; reversing both tapes merely relabels the seven phase classes, so the source-clock test of both relative orientations covers all four direction pairs. No language model, key guess, or assumed plaintext is used.

For retained target position j, let i=j+d be the source position, where 0<=d<=21 and the deletion offset d is nondecreasing. Under a target clock, every occurrence of the same target label at phase j mod7 must align to one common source label x. For a fixed x, a DP over occurrences keeps the smallest final offset for r matches, permitting skipped occurrences as mismatches. The maximum number of supported occurrences over x is an upper bound; impose bijectivity more strongly by solving a 29x29 maximum-weight assignment independently in each phase, where edge weight is this relaxed maximum. Summing unmatched occurrences over phases lower-bounds mismatches for every alignment and all 29!^7 keys. Independent choices of offsets between different groups deliberately relax the actual common alignment.

Under a source clock, group source occurrences by (i mod7, source label) and match to target position j=i-d. The same DP relaxes target-position distinctness as well as cross-group consistency, which can only weaken its lower bound. A perfect receiver must leave exactly 21 unmatched source positions. For each cut c in the longer tape, enumerate the exact count D of deletions before c. If i<c, a retained offset must satisfy D-(c-1-i)<=d<=D; if i>=c, D<=d<=D+i-c. Intersect these with d in [0,21], d<=i, and d>=21-(n-1-i). Every actual deletion pattern belongs to one cut branch. A branch is excluded when the assignment lower bound exceeds 21. One raw opposite-direction branch needs a second quarter cut, after which every count combination is excluded.

| Original register / relative direction | Target-clock minimum mismatches, assignment bound | Source-clock midpoint cut | Smallest midpoint bound | Remaining midpoint counts | Smallest second-cut bound |
| --- | ---: | ---: | ---: | --- | ---: |
| raw / same | 13 | 138 | 26 | none | — |
| raw / opposite | 13 | 138 | 21 | 10 | 35 |
| quotient / same | 6 | 137 | 28 | none | — |
| quotient / opposite | 10 | 137 | 30 | none | — |

All eight target-clock orientation cases fail; the both-reversed counterparts have assignment lower bounds 13, 13, 6, 10 respectively. All source-clock direction cases fail; raw opposite direction has exactly one surviving midpoint count D=10 at c=138, then all eleven possible counts 0..10 at c=69 have bounds at least 35, exceeding 21. The JSON records every cut bound and explicit repeated-label obstructions. This is an exact necessary-condition exclusion; the assignment relaxation is not claimed to give the true global edit minimum or a general full solver.

Controls: twelve independently seeded 21-insertion plants using the actual raw or quotient table as target, seven independent secret permutations, and both clocks retain every true target value (three seeds per register/clock). All true cut branches survive the bound. The Hungarian implementation also agrees with 128 exhaustive three-symbol assignment checks, and 384 toy lower-bound cases are checked against exhaustive deletion alignments and exact optimal per-phase assignments. Executed in connected JavaScript V8 on exact repository inputs; the standalone Node wrapper was not separately run in CI. Source corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; grid blob `2550eae357442912220e05dc51147523a61dd75a`.

[SFT](../sims/lp2_p29_p50_sharedG_arbitrary_deletion_phase_sft.cjs) · [full deterministic output](lp2-p29-p50-sharedG-arbitrary-deletion-phase.json). The complete original finite receiver is now closed regardless of deleted positions, direction or either fixed seven-phase clock. No unknown LP2 plaintext or key follows, and other phase laws, extra substitutions, and different source relationships remain outside this exact scope. Do not widen the model without a new independent selector.

## Reproduction and research decision

[Node 22/CommonJS single runnable test](../sims/lp2_p29_p50_sharedG_21deletion_allsecret_original_sft.cjs) uses the canonical original manuscript rune corpus and the pinned source-table byte SHA-256. **[Windows 11 GitHub Actions run 44993995184](https://github.com/FlareZ123/liber-primus/actions/runs/44993995184) passed** on the committed original data for the global capacity and planted inverse. The subsequent seven-phase extension was independently checked on original source data using the identical finite counting algorithm; a separate CI run for that amended script is requested. This expands the prior [shared-root p29/p50 report](lp2-p29-p50-shared-root24-quotient-common-codeword-decision.md), and it is distinct from the earlier direct [21-item repeating-pad test](../sims/lp2_p29_p50_g21_surplus_key_source_sft.cjs).

**Decision:** retire simple insertion-only or deletion-only p29/p50 correspondence with one arbitrary fixed 29-symbol secret alphabet even if unlimited position reordering is allowed. Also retire any ordered 21-item omission under either fixed seven-phase stationary substitution clock, regardless of the seven unknown alphabets or relative direction. At least five changed values beyond the 21 deleted positions would be necessary for the quotient pair, and no source selects those changes. This does **not** exclude a genuine source-selected position-changing keystream, an edit/substitution layer, a distinct numeral alphabet or an alternative quotient order. Avoid searching a compensatory five-error correction pattern without first finding independent original instructions that select its locations and operation. No genuine LP2 ciphertext has been decrypted by this result.
