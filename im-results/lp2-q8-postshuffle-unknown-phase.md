# Shared periodic additive key with whole-group shuffle: exact original coverage bounds

**Decision (25 November 2026):** #2684's calibrated long-anchor negative is strengthened to an all-secret-key obstruction in all nine illustrated chapters: both q8 and q13 fail at the frozen 5% OOV budget even with independently chosen group phases and arbitrary whole-group order. The largest p40–53 chapter requires period at least90 under this conditional model. No unknown plaintext or key recovered.

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

This long-anchor search alone did not exclude a short-word-only global SAT/SMT solution combining partial key constraints. The following all-secret-key extension now rejects that possibility for q8 and q13 under the same intact-group/lexicon/budget model. H-shuffle generally, H-decoy, different cipher or clock, and different word inventory remain open.

## All-secret-key segment-cover relaxation (Agent30, 25 November)

The prior long-anchor result left open a key assembled exclusively from short partial constraints. This extension closes that gap without constructing a single candidate key, estimating a language likelihood, or assuming any ordering of the printed groups. It tests **every additive GP29 periodic key**, including q8 and q13, with literal-F holds and arbitrary independent group phases. The prior #2683 vocabulary (10,842 distinct native rune words, maximum length24) and 5% group-OOV criterion are unchanged. Source input is the image-corrected transcription; all nine complete illustrated chapters are tested, retaining page carries.

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

## Original #2684 reproduction

- SFT: [sims/lp2_q8_postshuffle_unknown_phase_sft.cjs](../sims/lp2_q8_postshuffle_unknown_phase_sft.cjs)
- Original inputs: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, `resources/transcriptions/lp1_wulfic_canonical.txt`, `resources/external/relikd-solved-gp29-native-v1.json`, and the three donor files under `resources/control/`.
- Deterministic native-control seeds: `0x26840111`, `0x26840222`, `0x26840333`; matched null seed is each native seed XOR `0x5a5a5a5a`.
- Executed by [GitHub Actions run #984](https://github.com/FlareZ123/liber-primus/actions/runs/45540766626), checked out at `c8877b0219e62d137337fb93888c51365736f027`.
- Machine-readable output: [lp2-q8-postshuffle-unknown-phase-output.json](lp2-q8-postshuffle-unknown-phase-output.json).
