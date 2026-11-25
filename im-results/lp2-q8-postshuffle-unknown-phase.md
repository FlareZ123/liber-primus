# Shared periodic additive key with whole-group shuffle: exact original coverage bounds

**Decision (25 November 2026):** #2684's calibrated long-anchor negative is strengthened to an all-secret-key obstruction in all nine illustrated chapters: both q8 and q13 fail at the frozen 5% OOV budget even with independently chosen group phases and arbitrary whole-group order. The largest p40–53 chapter requires period at least90 under the narrow register. A 35,944-form broad-register extension reduces the lower bound to62 but still excludes both native periods across the book, after a constructive overlap-graph key attack excludes the one surviving terminal q13 case. No unknown plaintext or key recovered.

## Question and scope

Test whether the intact printed groups on one complete LP2 chapter can be genuine plaintext words whose **ciphertext groups were permuted after encryption**, where the original word sequence was encrypted by one unknown cyclic additive GP29 key of period 8. Each printed group therefore has an independently latent start phase, but all groups share the same eight key symbols. Literal plaintext F emits ciphertext F and does not consume a key position.

This is a deliberately narrow H-shuffle receiver, motivated by the known q8 WELCOME key length and the live distinction between H-shuffle and H-decoy. It is not a general test of every possible word permutation, cipher, or key schedule.

## Frozen target and receiver

- Original target: physical LP2 p40–53, selected as the largest complete chapter before cipher scoring.
- Source geometry: 3,008 runes in 669 complete printed groups; no group is clipped at either chapter boundary.
- Group-length histogram: 13×1, 101×2, 170×3, 128×4, 73×5, 53×6, 47×7, 42×8, 18×9, 11×10, 8×11, 3×12, 1×13, 1×14.
- Native lexicon: the exact #2683 frozen dictionary, 10,842 types, maximum word length 24; built from the first 80% of the Gibran, Shakespeare and Emerson donor texts plus solved LP1 sections excluding WELCOME and KOAN. It supplies 2,214 long anchor types with at least nine non-F consuming symbols.
- OOV allowance: at most 5% of groups, 33/669. The fixed acceptance threshold is therefore **636/669**.
- For every group-aligned long anchor, enumerate all eight possible start phases. Literal plaintext F must match ciphertext F and holds phase; every other rune consumes and imposes the exact difference on the shared eight-slot key. Repeated visits to a key slot must agree exactly. Key rotations are canonicalized.
- For each candidate key, invert every group at all eight latent starts, enumerating both literal-F holds and consuming non-F preimages at ciphertext F. A group is covered only when at least one exact dictionary word survives. No word-order score, fitted spelling, alternate period, or extra cipher layer is used.

The script first checks exact forward replay of the solved WELCOME (515 runes) and KOAN (319 runes) controls under the same additive/F-hold convention.

## Blind native controls and matched nulls

The controls are three contiguous 669-word windows from the held-out final 20% of the three donor texts. For each donor, the selection rule is the first contiguous window with no more than 33 words outside the frozen dictionary and maximum rune-word length 24. The windows are selected from source text and dictionary membership only, before any control key is generated. Their word order is encrypted continuously under a fresh hidden q8 key; only after encryption are the intact ciphertext groups shuffled.

| Native control | Held-out donor word offsets | OOV | Candidate keys | True-key coverage | Unique passing key | True words and phase edges retained |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | [10057, 10726) | 9 | 275 | 660/669 | Yes | 660/660 |
| Shakespeare | [44325, 44994) | 22 | 372 | 647/669 | Yes | 647/647 |
| Emerson | [59892, 60561) | 19 | 504 | 650/669 | Yes | 650/650 |

All three planted keys are recovered up to cyclic rotation, and each is the **only** candidate reaching the 636-group threshold. Every in-vocabulary true word and its true phase edge is present. The true hidden phase trail is preserved in all three plants. Per-group word/edge ambiguity remains measurable: unique word groups are 570, 472 and 535; unique phase-edge groups are 570, 466 and 528, respectively.

Three matched nulls use the same donor word sequences but encrypt each word with an independent random q8 pad and random start phase before shuffling. None reaches the acceptance threshold:

| Independent-pad null | Candidate keys | Best coverage | Missing groups | Passing keys |
|---|---:|---:|---:|---:|
| Gibran-matched | 280 | 154/669 | 515 | 0 |
| Shakespeare-matched | 381 | 172/669 | 497 | 0 |
| Emerson-matched | 469 | 156/669 | 513 | 0 |

**Calibration passed:** 3/3 true shared-key post-encryption shuffles recover their unique planted key and all in-vocabulary word/phase evidence; 0/3 independent-pad nulls pass.

## Original p40–53 result

The original produces **614** group-aligned long-anchor key candidates. Their anchor-support histogram is 614 candidates supported by exactly one printed group; **zero** candidates have support from two distinct groups.

No candidate reaches 636/669. The best candidate covers **105/669** groups (564 missing, 15.7% coverage); the next also covers 105, and the next-best scores 104. This is far below the fixed 95% acceptance threshold and even below the three independent-pad null maxima (154–172 groups).

There is consequently no plausible frozen key or plaintext inventory to pass to phase-order recovery. The original phase graph is not constructed or tuned after this negative result.

## Original long-anchor decision and scope

The initial #2684 test rejects this specific receiver on p40–53: one shared unknown additive GP29 q8 key, authentic literal-F hold, intact word-sized ciphertext groups, arbitrary independent group start phases, and a post-encryption permutation, with a key generated by at least one frozen in-vocabulary long anchor and validated against the remaining groups.

**Critic completeness correction (25 November):** the original long-anchor search is already exhaustive for p40–53 at its declared 33-group OOV budget. Independent parsing of the image-corrected source gives 35 groups with at least nine nonzero ciphertext runes. Every such rune necessarily consumes under literal-F hold, so at least two of those 35 groups must have in-register plaintext anchors of at least nine consuming runes. `makeCandidateKeys` enumerates all such words and all eight start phases, requiring repeated-slot agreement. Consequently every passing key must occur in the candidate pool and have at least two distinct supporting groups. The recorded zero multi-group keys is itself an all-key contradiction for this chapter and budget. A short-word-only CSP cannot evade it unless the budget, register or mechanism changes. The segment-cover extension below is still valuable: it establishes a separate, stronger coverage/period lower bound across all nine chapters and q13, without requiring long anchors. H-shuffle generally, H-decoy, different cipher or clock, and different word inventory remain open.

## All-secret-key segment-cover relaxation (Agent30, 25 November)

The prior long-anchor result already excludes every q8 key on p40–53 at the frozen OOV budget, as established above. This extension generalizes the decision to other chapters and periods without requiring a complete anchor, constructing a single candidate key, estimating a language likelihood, or assuming any ordering of the printed groups. It tests **every additive GP29 periodic key**, including q8 and q13, with literal-F holds and arbitrary independent group phases. The prior #2683 vocabulary (10,842 distinct native rune words, maximum length24) and 5% group-OOV criterion are unchanged. Source input is the image-corrected transcription; all nine complete illustrated chapters are tested, retaining page carries.

### Exact necessary inequality

For each ciphertext group c, choose its earliest longest contiguous nonzero-ciphertext span, capped at eight runes. For any length m from 2 to the capped span length, enumerate all frozen same-length vocabulary words p, keeping those for which each literal plaintext F (index0) occurs only at ciphertext F. This allows consuming ciphertext F and arbitrary holds outside the span; it deliberately relaxes all remaining cipher consistency. Within the chosen nonzero span, plaintext F is impossible, so its m key values must be consecutive. Form the exact base29 tuple d = (c_j − p_j mod29) over those m locations. Retain distinct tuples per group.

For a fixed m and group subset G, let n_m(d) count the number of distinct groups admitting tuple d. Any cyclic period-q key has at most q distinct length-m cyclic substrings (even if q < m). Each vocabulary-covered group must admit at least one of those substrings. Consequently:

**covered(G) ≤ min(|G|, sum of the q largest n_m(d)).**

The right side grants the key arbitrary, possibly mutually incompatible substrings and double-counts groups covered by several tuples. It is therefore an upper bound, not an assumed realizable key. Taking the complementary uncovered count gives a rigorous lower bound on required OOV groups. Evaluate each m threshold across all groups with sufficiently long spans, and separately partition by capped span length and sum the disjoint-stratum lower bounds. Take the maximum of these valid bounds. Groups with no span of length2 are granted free coverage. Neither hidden-F masks nor cyclic start phases need to be guessed. A true in-vocabulary plaintext is never pruned by this relaxation.

The monotone lower bound can be evaluated for any q. Binary search its crossing of the frozen OOV budget; the resulting required period is a necessary lower bound for every actual key, not a sufficient period or key identification. The period can vary independently per chapter. For a shared book-wide key the strongest chapter bound applies.

### Original chapter results

| Physical pages | Groups | OOV budget | q8 min OOV | q13 min OOV | Necessary q ≥ | Bound at q−1 → q |
|---|---:|---:|---:|---:|---:|---:|
| p0–2 | 158 | 7 | 50 | 35 | 34 | 8 → 7 |
| p3–7 | 255 | 12 | 106 | 86 | 48 | 13 → 12 |
| p8–14 | 383 | 19 | 163 | 137 | 64 | 20 → 19 |
| p15–22 | 437 | 21 | 190 | 151 | 69 | 22 → 21 |
| p23–26 | 224 | 11 | 89 | 69 | 42 | 12 → 11 |
| p27–32 | 326 | 16 | 127 | 107 | 53 | 17 → 16 |
| p33–39 | 378 | 18 | 162 | 135 | 59 | 20 → 18 |
| p40–53 | 669 | 33 | 347 | 264 | 90 | 35 → 33 |
| p54–55 | 66 | 3 | 14 | 4 | 14 | 4 → 3 |

All 18 chapter/period combinations fail. Even allowing nine unrelated keys, the summed minimum OOV counts are **1248/2,896** for q8 and **988/2,896** for q13. For p40–53 alone, length-three segments give a minimum of 286 OOV groups at q8 and 155 at q13; length-four segments give 294 and264. Thus this is genuinely independent of the presence of a complete long anchor. For every q≤89 on p40–53 the bound exceeds33; q90 merely passes this *relaxed* necessary condition. The terminal chapter's q13 rejection is narrow (4 versus3 OOV) and sensitive to the frozen vocabulary, unlike the much larger margins elsewhere.

### Held-out calibration

Use the first 669-word contiguous windows in the final 20% of the three existing donor texts meeting the frozen 33-OOV budget; the window selection does not inspect keys or ciphertext. Generate independent deterministic q8 and q13 keys, continuously encrypt with literal-F holds, then shuffle whole ciphertext groups. The actual key and plaintext are used only for diagnostic true-segment assertions and to check the mathematical lower bound, never in computing tuple coverage.

| Donor | q | Actual OOV | F holds | Consuming C=0 | Min OOV | Necessary q ≥ | True segment assertions |
|---|---:|---:|---:|---:|---:|---:|---:|
| Gibran | 8 | 9 | 56 | 54 | 6 | 7 | 1575 |
| Gibran | 13 | 9 | 56 | 80 | 7 | 11 | 1571 |
| Shakespeare | 8 | 22 | 56 | 91 | 12 | 7 | 1559 |
| Shakespeare | 13 | 22 | 56 | 94 | 13 | 11 | 1566 |
| Emerson | 8 | 19 | 65 | 126 | 15 | 8 | 1624 |
| Emerson | 13 | 19 | 65 | 121 | 13 | 11 | 1622 |

All six true-key plants pass, all minimum periods are no larger than their planted periods, and every true in-vocabulary segment inspected is admitted. This is calibration of the obstruction, not a blind key-recovery claim. The existing #2684 genuine WELCOME/KOAN replay and key-recovery controls are retained above.

### Decision

Retire any chapter-private or book-wide **period8 or period13 additive GP29/literal-F-hold receiver with intact word units**, even if all printed groups are arbitrarily shuffled and no long anchor exists. Under this same fixed finite lexicon and budget, a p40–53 receiver would require period at least90; shorter key search and exact phase-trail fitting cannot rescue it. Do not infer that the true cipher has q90 or that a q≥90 search is warranted: the independent source instruction and key provenance remain missing. H-decoy, a different plaintext register or word units, different transformation, and nonperiodic or word-specific keys remain outside scope. No authentic plaintext/key is recovered.

- [Standalone CommonJS SFT](../sims/lp2_postshuffle_allkey_segment_cover_sft.cjs)
- [Complete per-stratum/threshold integer counts, control keys and input blob identities](lp2-postshuffle-allkey-segment-cover-output.json)
- Executed on fetched repository sources in connected V8; standalone Node/Windows CI has not been run for this extension.

## Broader spelling register and actual terminal key-cycle inverse

The narrowest initial margin was p54–55 q13 (4 required OOV versus budget3). To distinguish vocabulary restriction from the underlying key constraint, take the union of the original frozen 10,842 words with all valid native forms in the existing TextBlob frequency-list source `resources/control/english_wordfreq_textblob.txt`: both greedy GP transliteration and the independently used explicit ING/IO convention, and every GP29 singleton. The union contains **35,944 distinct forms** (maximum length24); no original LP2 words are fitted. Retain the original donor windows, planted keys and 5% allowance. This is an independent register sensitivity test, not an assertion of complete English coverage.

| Physical pages | Groups | Budget | q8 min OOV | q13 min OOV | Necessary q ≥ from support alone |
|---|---:|---:|---:|---:|---:|
| p0–2 | 158 | 7 | 43 | 31 | 27 |
| p3–7 | 255 | 12 | 90 | 60 | 32 |
| p8–14 | 383 | 19 | 141 | 111 | 39 |
| p15–22 | 437 | 21 | 160 | 129 | 43 |
| p23–26 | 224 | 11 | 74 | 49 | 31 |
| p27–32 | 326 | 16 | 117 | 87 | 37 |
| p33–39 | 378 | 18 | 150 | 120 | 43 |
| p40–53 | 669 | 33 | 285 | 237 | 62 |
| p54–55 | 66 | 3 | 12 | 2 | 13 |

The six held-out controls remain legal under the broad union:

| Donor | q | Actual OOV | Bound OOV | Necessary q ≥ |
|---|---:|---:|---:|---:|
| Gibran | 8 | 3 | 3 | 7 |
| Gibran | 13 | 3 | 3 | 11 |
| Shakespeare | 8 | 14 | 6 | 7 |
| Shakespeare | 13 | 14 | 5 | 10 |
| Emerson | 8 | 8 | 7 | 7 |
| Emerson | 13 | 8 | 4 | 11 |

The eight larger chapters still reject both native periods, and p40–53 excludes all q≤61. Only p54–55 q13 survives the relaxed support bound. Rather than increase the budget, search the actual cyclic-key consistency required at this surviving target.

### Exact overlap-graph key inverse on p54–55

There are 28 terminal groups with a contiguous nonzero-C span of at least five runes. To satisfy the overall budget3, at least25 of these must admit a cyclic length-five key substring. Exhaustive broad-register support counts establish that **no tuple supports more than two distinct groups**; exactly265 tuples support two. Therefore a period13 key covering25 groups must have at least12 distinct double-supported cyclic five-windows. Consecutive five-windows of one cyclic key necessarily overlap by four symbols. Construct the directed de Bruijn-style graph with each double-supported tuple as an edge from its four-symbol prefix to its four-symbol suffix.

A viable q13 key has a path of at least12 distinct good edges, because at most one of the 13 cyclic positions can fall outside the required 12 good windows. Exhaustively enumerate edge-simple paths to depth12. For a path of length12, test whether a final (possibly single-supported) closing edge exists; reconstruct the complete key from edge-leading symbols, assert every cyclic window, canonicalize rotation and evaluate exact GP29 literal-F word coverage across all original groups. This searches the actual key rather than optimizing a relaxation.

**Constructed positive before original:** choose two distinct held-out, in-vocabulary, non-F five-rune donor words per phase of a planted q13 key, selected so their ciphertext contains no zero. This is a phase-saturated lexical fixture, not continuous prose. Graph has230 double-supported edges,384 visited search nodes,14 length12 paths,13 closures. All closures give one rotation-class key, exactly the planted key, with26/26 full word groups covered. Original all-secret-key proof does not depend on this fixture distribution. An initial implementation used an incorrect one-symbol prefix rather than the four-symbol prefix; the positive assertion stopped execution before original scoring. The corrected implementation uses floor(tuple/29) and reruns the fixture before the original.

**Original terminal:** 265 double-supported edges,265 visited nodes, **maximum path length1**, zero length12 paths, zero closures, zero candidate keys. No two double-supported tuples can be consecutive in either direction. The edge-simple search by itself would not rule out a self-loop; a separate Critic reconstruction of the frozen 35,944-form register and all 28 eligible original groups independently confirms exactly 265 double-supported tuples, zero self-loops and zero suffix-to-prefix adjacencies (including identical edges). Thus a q13 key cannot meet the group budget. More generally, any cyclic period-q key has at most floor(q/2) double-supported positions, so its coverage of these 28 groups is at most q+floor(q/2). To cover25 requires **q≥17**. This raises the terminal broad-register minimum from13 to17; it does not identify a q17 key or warrant searching it without a source-selected premise.

**Updated decision:** q8 and q13 are excluded in every physical-page chapter under the broader finite 35,944-form register and 5% group OOV allowance, even with arbitrary independent phases and no ordering assumption. For p40–53 q≥62 is necessary; for p54–55 q≥17 is necessary after exact overlap. H-decoy, other plaintext registers, nonperiodic or word-specific keys and other cipher families remain live. There is no original key or recovered plaintext. The exact graph construction is a reusable constructive recovery algorithm when source constraints force many repeated-supported key segments; do not confuse a positive fixture with an LP2 solution.

- Reproduce original narrow run: `node sims/lp2_postshuffle_allkey_segment_cover_sft.cjs`
- Reproduce broad union and terminal graph: `node sims/lp2_postshuffle_allkey_segment_cover_sft.cjs --broad`
- [Broad per-group-support output, graph and planted key](lp2-postshuffle-allkey-segment-cover-broad-output.json).
- Physical chapter cuts here are source page ranges. Agent1's independent #2678 [fixed-key phase-graph report](lp2-native-key-postshuffle-phase-graph.md) uses the literal dollar delimiter for one internal cut, assigning two more groups to p8–14 and two fewer to p15–22. Do not combine those chapter counts. Both use all2,896 original groups.

## Source-motivated q29 extension: joint max-plus substring automaton

The exact GP29 alphabet correspondence with the 29 Anglo-Saxon rune-poem stanzas independently motivates testing q29 as an exploratory period (not an authenticated cipher instruction). Prior [continuous q29 lexical](agent2-period29-fhold-exact-word-relation-gate.md) and [spacing-free](lp2-period29-fhold-spacingfree-gate.md) results do not settle the arbitrary word-shuffle/phase model. The broad 35,944-form support bound rejects q29 in seven of nine original chapters. Opening p0–2 and terminal p54–55 survive that relaxation; test those using a joint cycle-consistency bound rather than another continuous-clock search.

For each length m in {5,8}, let S_m(x) count the number of eligible printed groups admitting selected nonzero ciphertext-span difference tuple x. With n_m eligible groups and a total chapter OOV budget B, any valid cyclic key K of period q must satisfy the joint necessary inequality

    sum_{i=0}^{q-1} (S_5(K[i..i+4]) + S_8(K[i..i+7]))
      >= max(0,n_5-B) + max(0,n_8-B)

(indices modulo q). Each in-register eligible group has at least one required tuple, so counting every occurrence and counting groups separately by m can only overcount coverage. No phase or group ordering is assumed. The two lengths jointly constrain the same key; independent top-q support lists permit incompatible substrings.

Construct an Aho-Corasick automaton of all supported five- and eight-tuples, weighted by group support. Each emitted GP digit contributes the sum of the support weights of every matched suffix. For each state u, compute D_0(u)=0 and D_t(u)=max_{a in GP29}(weight(next(u,a))+D_{t-1}(next(u,a))). The maximum over all u is the exact best t-step walk allowing arbitrary predecessor context and arbitrary terminal state. Every period-q key is one such q-step walk from the state reached by its periodic predecessor context, but not every walk closes; repetitions may also double-count groups. This is therefore a rigorous *upper* bound, never a purported key reconstruction. The first length where it meets the required score gives a necessary period lower bound. We use unit weights and the fixed pair {5,8}; no language-score/key fitting.

| Physical pages | Groups | Budget | Independent q29 OOV lower bound | Joint q29 upper / required | Necessary period after available joint bound |
|---|---:|---:|---:|---:|---:|
| p0–2 | 158 | 7 | 5 | 29/63 | 63 |
| p3–7 | 255 | 12 | 18 | not needed | 32 |
| p8–14 | 383 | 19 | 37 | not needed | 39 |
| p15–22 | 437 | 21 | 57 | not needed | 43 |
| p23–26 | 224 | 11 | 15 | not needed | 31 |
| p27–32 | 326 | 16 | 32 | not needed | 37 |
| p33–39 | 378 | 18 | 50 | not needed | 43 |
| p40–53 | 669 | 33 | 131 | not needed | 62 |
| p54–55 | 66 | 3 | 0 | 24/31 | 38 |

For p0–2 the automaton has 560,497 states, n5=61 and n8=16, upper 29 against required 63; the first relaxed pass is q63. For p54–55 it has 277,628 states, n5=28 and n8=9, upper 24 against required 31; the first relaxed pass is q38. This improves the earlier terminal q17 and opening q27 necessary bounds and excludes *every* q≤29 in all nine chapters under the broad finite-register model, even with independently chosen keys and per-group phases.

Calibration: 64 exact toy comparisons with exhaustive binary open-context strings; six held-out contiguous native donor windows of 66 or 158 groups, selected by the previously frozen OOV criterion, planted independently with q29 literal-F-hold keys and shuffled whole ciphertext groups. The automaton upper bound exceeds the actual cyclic support in all six, and all actual cyclic support scores reach the respective required thresholds.

| Donor | Groups | Actual OOV | Literal-F holds | Consuming C=0 | True cyclic support | Upper / required |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | 66 | 1 | 2 | 6 | 21 | 26/16 |
| Gibran | 158 | 1 | 15 | 19 | 41 | 47/31 |
| Shakespeare | 66 | 1 | 3 | 12 | 24 | 35/18 |
| Shakespeare | 158 | 1 | 10 | 30 | 49 | 50/35 |
| Emerson | 66 | 0 | 8 | 3 | 13 | 24/9 |
| Emerson | 158 | 3 | 13 | 30 | 38 | 44/27 |

This is a new exact optimization of the relaxed joint support, not an additional LP2 plaintext/key candidate. The first relaxed passing periods 63 and 38 are necessary bounds, not actual inferred periods. No additional period sweep is motivated by these values. H-decoy, other representations and nonperiodic keys remain open. The full q29 output records all DP maxima and input blob identities; the same SFT has an additional `--q29` mode. Executed on exact repository inputs in connected V8; no separate Windows CI assertion.

- [Raw q29 results](lp2-postshuffle-allkey-joint-q29-output.json)
- [SFT](../sims/lp2_postshuffle_allkey_segment_cover_sft.cjs): `node sims/lp2_postshuffle_allkey_segment_cover_sft.cjs --q29`

## Constructive shared q76 key recovery across chapters (Agent 23)

This is a stronger sharing assumption than the chapter-local bounds above: one cyclic additive key for all original pages, with independent latent start phase per intact printed group, literal F holds, and the same 35,944-form broad vocabulary. The 76-cell outer ring of the p50 table provides a concrete length to test, but does not establish that ring length is a cipher period. Fit on p0–39 (2,161 groups), withholding p40–55 (735 groups). For each training group enumerate all contiguous nonzero six-rune windows and compatible dictionary words of its length; count each implied six-rune key tuple at most once per group. A tuple supported by at least three groups is a directed edge from its first five symbols to its last five. Enumerate cyclic 76-edge walks, allowing repetitions; the 1,000,000-call safeguard was never reached. Verify candidate rotations by independently inverting all withheld groups, all starting phases and both legal interpretations of ciphertext F.

Three random period-76 planted keys were recovered uniquely up to rotation. Controls sampled matched original word lengths from each donor's final 20%, with 7/3/0 rare missing-length samples taken from the pooled held-out donors. They are deliberately length-matched synthetic word sequences, not coherent native prose. Dictionary OOV counts were 79/88/65 across all 2,896 groups. The true cycle's minimum support was 6/3/8 groups per tuple; each of the 717/714/721 in-vocabulary withheld true plaintext words is retained (382/378/388 uniquely); the others may have alternative dictionary inverses. Key recovery is exact but plaintext ordering and ambiguous words are not identified by this receiver.

On original p0–39, 522 groups have an eligible nonzero six-window. Of 4,383,040 distinct candidate tuples, 4,366,806 have support one, 16,196 support two, 38 support three, and none higher. No two support-three edges join (maximum walk length one); there is no candidate cycle to test on the holdout. This is not a general graph attack on arbitrary longer keys.

**Exact coverage consequence independent of the support-three graph:** At most floor(2161×.05)=108 words can be OOV. At least 414 of the 522 eligible groups must therefore admit an actual key tuple. The q distinct cyclic length-six windows can cover at most the sum of the q largest distinct tuple supports; overcounting groups only relaxes the bound. For q76 this upper bound is 190; for q180 it is 398. For q187 it is 412; q188 first reaches 414. Thus a single common key across p0–39 needs q≥188 under this model and budget. This does not supersede the weaker chapter-private bounds: different independent chapter keys are outside the sharing assumption. A necessary period lower bound is not evidence that any period at or above it works. No authentic LP2 key or plaintext recovered.

- [SFT](../sims/lp2_postshuffle_q76_longanchor_cycle_sft.cjs)
- [Raw results](lp2-postshuffle-q76-longanchor-cycle.json)
- Executed in connected V8; no separate CI claim.

## Original #2684 reproduction

- SFT: [sims/lp2_q8_postshuffle_unknown_phase_sft.cjs](../sims/lp2_q8_postshuffle_unknown_phase_sft.cjs)
- Original inputs: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, `resources/transcriptions/lp1_wulfic_canonical.txt`, `resources/external/relikd-solved-gp29-native-v1.json`, and the three donor files under `resources/control/`.
- Deterministic native-control seeds: `0x26840111`, `0x26840222`, `0x26840333`; matched null seed is each native seed XOR `0x5a5a5a5a`.
- Executed by [GitHub Actions run #984](https://github.com/FlareZ123/liber-primus/actions/runs/45540766626), checked out at `c8877b0219e62d137337fb93888c51365736f027`.
- Machine-readable output: [lp2-q8-postshuffle-unknown-phase-output.json](lp2-q8-postshuffle-unknown-phase-output.json).
