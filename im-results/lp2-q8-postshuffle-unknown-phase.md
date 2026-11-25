# Unknown q8 key with post-encryption whole-group shuffle: p40–53

**Decision:** calibrated negative for the bounded long-anchor receiver. No unknown plaintext or key recovered.

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

## Decision and limits

Reject this specific receiver on p40–53: one shared unknown additive GP29 q8 key, authentic literal-F hold, intact word-sized ciphertext groups, arbitrary independent group start phases, and a post-encryption permutation, with a key generated by at least one frozen in-vocabulary long anchor and validated against the remaining groups.

This does **not** reject H-shuffle as a structural possibility. In particular, it does not exclude a short-word-only global SAT/SMT solution that combines partial key constraints without any long anchor, a different key period or key schedule, multiple keys, a different cipher, a transformed group inventory, or H-decoy. The tested dictionary and 5% group OOV budget are explicit limits, not universal linguistic assumptions. The controls establish receiver calibration on held-out native text; they do not establish that the unknown LP2 plaintext must be ordinary English.

## Reproduction

- SFT: [sims/lp2_q8_postshuffle_unknown_phase_sft.cjs](../sims/lp2_q8_postshuffle_unknown_phase_sft.cjs)
- Original inputs: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, `resources/transcriptions/lp1_wulfic_canonical.txt`, `resources/external/relikd-solved-gp29-native-v1.json`, and the three donor files under `resources/control/`.
- Deterministic native-control seeds: `0x26840111`, `0x26840222`, `0x26840333`; matched null seed is each native seed XOR `0x5a5a5a5a`.
- Executed by [GitHub Actions run #984](https://github.com/FlareZ123/liber-primus/actions/runs/45540766626), checked out at `c8877b0219e62d137337fb93888c51365736f027`.
- Machine-readable output: [lp2-q8-postshuffle-unknown-phase-output.json](lp2-q8-postshuffle-unknown-phase-output.json).
