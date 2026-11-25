# Nonperiodic authentic prime-clock inversion with arbitrary word ordering

**Agent 9, 25 November 2026.** Exact original-input lexical inversion; no unknown LP2 plaintext or authenticated new key recovered.

## Decision

The solved p56 prime-minus-one cipher cannot be transferred to LP2 simply by arbitrarily reordering intact encrypted words (even across chapters) and choosing a starting prime ordinal from 0 through 3301, under the frozen 35,944-form broad native-English register and 5% out-of-vocabulary allowance. **All 343 original printed groups of length at least eight have empty inverse domains** under each of the two global additive signs. The original has 2,896 groups; at least 343 must be outside this register, whereas the 5% budget permits 144. Every chapter separately violates its own 5% budget even when given access to the complete book-wide prime-ordinal range. No group-order reconstruction follows.

The independent dihedral extension below also excludes arbitrary ciphertext-side within-group rotations and reversals: 2/343 and 0/343 anchors, respectively, with every chapter still exceeding its OOV allowance.

This differs from the prior q8/q13/q29 all-secret cyclic-key bounds: the authentic prime clock is nonperiodic, and the attack identifies absolute prime-ordinal locations of correctly decrypted groups when they exist. It is not a rerun of direct printed-order prime-clock transfer or of short-period phase graphs.

## Source-selected operation and inverse

The historical operand is the authenticated p56 key schedule, zero-indexed:

```
K[j] = (prime[j] - 1) mod 29
if P == F: C = F, j unchanged
else: C = (P + sign * K[j]) mod 29, j advances once
```

The canonical native p56 plaintext from the pinned relikd register exactly reproduces **85/85 original ciphertext runes with 84 consuming primes** under positive sign. Negative sign is an explicit additional variant, not the historical p56 convention.

Grant arbitrary reordering of whole ciphertext groups, arbitrary initial prime ordinal 0–3301, and arbitrary literal-F masks (ciphertext F can also be an encrypted non-F). For a 12,956-rune source, no valid consuming position can exceed ordinal 16,256. Thus independently offering every group every start in [0,16257) is a strict relaxation of all possible continuous book traversals in the model. Independent chapter/physical-page resets within the same initial-ordinal bound also fit this relaxation provided a printed group itself is processed contiguously. No constraints on neighboring groups, unique prime positions, title keys or linguistic word order are needed for rejection. Group-internal resets, invisible extra advances, within-group permutations, changed word segmentation, other prime sequences and unrestricted origins are outside the claim.

For each candidate group and every possible absolute start ordinal, enumerate both legal branches at visible ciphertext F. Reject a consuming branch yielding plaintext F; follow a trie of the frozen vocabulary, pruning only missing prefixes. A terminal trie node yields the exact plaintext word and absolute start/end key cursors. Every original word of length 8 or more was tested; shorter words are granted unconditional validity. Both signs were enumerated separately. There is no language-score threshold or heuristic beam.

Inputs: canonical `resources/liber-primus/lp2-corpus.json`, `resources/transcriptions/lp2-image-corrected.txt`, `resources/external/relikd-solved-gp29-native-v1.json`, the first 80% of three GP-normalized literary corpora and the existing TextBlob frequency register using both ING/IO spelling conventions. The exact broad union (35,944 forms, all singletons included) is the same construction used in the prior all-secret short-period report. The parser asserts 12,956 matching original rune positions and all 2,896 complete groups.

## Exact original results

| Physical chapter | Printed groups | Empty long-group domains (+ or −) | 5% OOV allowance |
| --- | ---: | ---: | ---: |
| p0–2 | 158 | 21 | 7 |
| p3–7 | 255 | 27 | 12 |
| p8–14 | 383 | 46 | 19 |
| p15–22 | 437 | 48 | 21 |
| p23–26 | 224 | 26 | 11 |
| p27–32 | 326 | 36 | 16 |
| p33–39 | 378 | 45 | 18 |
| p40–53 | 669 | 84 | 33 |
| p54–55 | 66 | 10 | 3 |
| **Whole book** | **2896** | **343** | **144** |

No compatible lexical anchor occurs in either sign. The necessary OOV fraction is at least 11.844%; the actual required fraction may be higher because shorter groups were never tested.

## Constructive positive controls

Six 669-word shuffled literary plants use three held-out donor windows (the final 20% of Gibran, Shakespeare, Emerson), true hidden absolute origins 0, 1033 and 3301, and both signs. All contain both literal-F holds and consumed ciphertext zeros. Each entire candidate search gets the same generous origin bound plus its own plaintext rune count. The broader TextBlob register is an independent lexical resource and may include the held-out prose words; these are target-excluded donor-sequence controls, not unseen-word controls.

| Donor (each sign) | Long groups | In-register long groups | True exact inverse edges retained | Unique exact absolute location and plaintext |
| --- | ---: | ---: | ---: | ---: |
| Gibran | 26 | 23 | 23 | 23 |
| Shakespeare | 53 | 47 | 47 | 47 |
| Emerson | 59 | 55 | 55 | 55 |

All **250/250 in-register long anchors** across the six controls uniquely recover their true plaintext, absolute start and end cursor. The other 26 long groups are outside the register; none produces a spurious lexical inverse. The controls demonstrate the ability to recover an ordered set of absolute long-word anchors despite shuffling; they do not establish complete word-order recovery for all shorter words.

## Reproduction and next decision

- [Single-file CommonJS inverse](../sims/lp2_postshuffle_prime_clock_long_anchor_sft.cjs), commit `f0de88baef546456135ff61a7efa65dd3b73d567`.
- [Executed full result](lp2-postshuffle-prime-clock-long-anchor-output.json), commit `a6d095243d5f9961c21aad44533b3353d929afa2`.

The complete algorithm ran in connected V8 JavaScript on the source inputs; the standalone Node wrapper was not separately executed. No CI was created.

Retire this direct nonperiodic prime-clock transfer under the intact-group premise. It leaves the decoy-boundary model open. The useful reusable component is the exact trie/absolute-cursor inversion for a *source-selected nonperiodic key stream*: it can reveal genuine absolute anchors rather than merely count periodic collisions, if a new independent clue supplies the stream.


## Collision-rejection extension (same invocation)

The original zero-coverage result survives unlimited **collision-only** redraws. At current prime cursor j, let d(j) be the first subsequent ordinal whose residue differs from K[j]. An emission consumes at most d(j)+1 as its new cursor: it may reject equal candidates but must accept the first differing candidate. The function d(j)+1 is nondecreasing. Thus iterating it 12,956 times from maximum initial ordinal 3,301 bounds every possible cursor by **29,220** (literal-F holds can only lower it). Every word is granted every start below that bound and an arbitrary preceding ciphertext symbol. The first-rune relaxation admits any legal skip length through the initial equal-residue run; subsequent runes use the actual immediately preceding ciphertext. The trie enumerates every allowed plaintext-F hold, direct acceptance and collision-only retry. A cursor equal to the full-book upper bound before the last emission cannot occur on a real full-book path, since the bound increases strictly at every iteration.

| Sign | Original long groups | Compatible groups | Minimum OOV | 5% allowance |
|---|---:|---:|---:|---:|
| + | 343 | 0 | 343 | 144 |
| − | 343 | 0 | 343 | 144 |

All nine chapters independently exceed their budgets with the full-book cursor relaxation. Six newly collision-encrypted shuffled controls with 59–76 rejected keys per window retain all 250/250 true long-anchor plaintext/start/end triples, and 26 OOV anchors still have no candidate. The free predecessor makes exact cursor identity ambiguous (12/250 unique true triples); this is a valid coverage gate, not unique clock reconstruction. The authentic p56 control still replays 85/85.

No original candidate survives the widened hypothesis. Retire the direct prime-minus-one H-shuffle transfer even when granting all collision-only rejection decisions and an unknown preceding ciphertext at every group. This does not cover arbitrary non-collision skips, unknown unrelated generators or decoy segmentation.

[SFT](../sims/lp2_postshuffle_prime_collision_anchor_sft.cjs) · [raw execution](lp2-postshuffle-prime-collision-anchor-output.json). Both executed against repository inputs in connected JS; no separate Windows CI. Commits 1d674d88f8548f5d72c4a4203ff71f2dd693166d and 0b580910043af99a3c8c31d7d00c27dde6f54515.

## Independent within-group dihedral extension (Agent44, 25 November 2026)

The preceding intact-order exclusions do not cover cyclic rotations of an encrypted word. The signed words/numbers direction message and p57 circumference wording motivate testing this additional reversible representation, but neither explicitly selects it. Grant every complete printed group its own arbitrary cyclic rotation and direction, i.e. every distinct element of its dihedral orbit, as an outer ciphertext permutation. For each undoing orientation run the same exact absolute-prime trie inverse, both global signs, each start 0–16,256, all legal F branches. This is a strict relaxation of any source-fixed within-word rotation/reversal in this architecture; no group reordering, orientation rule or cursor is fitted. It does not grant arbitrary internal permutations, changed membership, or extra prime advances. The earlier collision-redraw experiment is separate; the combination with independent rotations is not tested here.

| Physical chapter | Groups | Long anchors | Covered (+ / −) | Minimum OOV (+ / −) | 5% allowance |
|---|---:|---:|---:|---:|---:|
| p0–2 | 158 | 21 | 0 / 0 | 21 / 21 | 7 |
| p3–7 | 255 | 27 | 0 / 0 | 27 / 27 | 12 |
| p8–14 | 383 | 46 | 1 / 0 | 45 / 46 | 19 |
| p15–22 | 437 | 48 | 0 / 0 | 48 / 48 | 21 |
| p23–26 | 224 | 26 | 0 / 0 | 26 / 26 | 11 |
| p27–32 | 326 | 36 | 1 / 0 | 35 / 36 | 16 |
| p33–39 | 378 | 45 | 0 / 0 | 45 / 45 | 18 |
| p40–53 | 669 | 84 | 0 / 0 | 84 / 84 | 33 |
| p54–55 | 66 | 10 | 0 / 0 | 10 / 10 | 3 |
| Whole book | 2896 | 343 | 2 / 0 | 341 / 343 | 144 |

All chapters fail even if every short group is granted free. The two positive-sign isolated candidates occur at global zero-based groups 456 (start ordinal 13,701; undo left rotation 7) and 1604 (ordinal 1,858; undo left rotation 5). Exact original rune values and candidate indices are in the raw output. They are isolated vocabulary hits with no supported neighboring anchor chain or authenticated ordering; do not present them as recovered text.

Six independent deterministic literary controls (Gibran/Shakespeare/Emerson final 20%, 669 words each, both signs, hidden origins 0/1033/3301; seed 330144) were encrypted with the same F-hold law, independently rotated/reversed, and whole-word shuffled. All 250/250 in-register long groups recovered their unique correct plaintext, absolute start/end cursor and ciphertext orientation (deduplicated by oriented sequence); each exact forward replay verified. The 26 OOV anchors yielded no hits. Authentic p56 still replays 85/85 at 84 consumed primes. This shows concrete inverse power on the widened planted architecture, while all original chapters fail. Retire arbitrary dihedral outer word permutations under the direct nonperiodic prime-clock and finite vocabulary premises. A different key or H-decoy remains open.

[One-file CommonJS reproducer](../sims/lp2_postshuffle_prime_dihedral_anchor_sft.cjs) · [raw result](lp2-postshuffle-prime-dihedral-anchor-output.json). Full numerical experiment executed directly in connected V8 JavaScript on canonical repository inputs; the saved wrapper was derived from the existing SFT and has not separately run under Windows Node. No new CI. No unknown plaintext/key.

## Arbitrary post-encryption intragroup permutation (Agent44, 25 November 2026)

The dihedral result leaves arbitrary inner permutations. This exact **outer** multiset receiver is distinct from [Agent29 #2730](lp2-p56-intragroup-multiset-prime-clock.md), which grants reordered *decrypted* words while maintaining ciphertext/key alignment. Here every ordered lexical word is encrypted with the authentic p56 literal-F-hold law at each feasible absolute cursor, and its encrypted multiset is matched to each observed group, granting arbitrary post-encryption permutation as well as independent within-chapter group order. This is a maximal relaxation of the earlier circumference/rotation hypothesis, not a source-selected permutation. No collision redraw. The 35,944-form register and full-book bound 16,257 remain fixed. Each length-matched word/cursor candidate is hashed by sum of fixed 32-bit rune weights, with precomputed pair contributions; every matching hash is verified against exact sorted encrypted runes. Hash collisions cannot create lexical edges or lose true matches.

**548,682,214 word/cursor candidates** across two signs, including original and matched control targets. The positive sign yields 872 original edges covering 217/343 long groups; negative 741 covering 201/343. Unlike the dihedral result, unrestricted independent group starts alone do not exceed the book-wide 5% OOV budget (126 or 142 missing versus 144). Do not claim that weaker global hypothesis excluded.

A real chapter occupying a contiguous prime-clock interval must have all its selected word intervals contained within a window of at most its rune count R (literal F can only reduce advances). For any candidate edge [s,t), all possible window origins are the integer interval [max(0,t−R),s]. Merge these intervals per original group, then sweep endpoints across all possible origins, counting each group at most once. This gives the exact maximum long-group coverage achievable in any window, while ignoring disjointness, gaps and shorter groups, and even allowing windows to extend beyond the overall clock bound. Therefore failure is sufficient without interval tiling.

| Chapter | Long groups | Covered in any origin (+/−) | Best shared-window coverage (+/−) | Minimum required |
|---|---:|---:|---:|---:|
| p0–2 | 21 | 14 / 13 | 7 / 6 | 14 |
| p3–7 | 27 | 14 / 14 | 6 / 7 | 15 |
| p8–14 | 46 | 25 / 28 | 12 / 13 | 27 |
| p15–22 | 48 | 34 / 29 | 17 / 15 | 27 |
| p23–26 | 26 | 17 / 15 | 7 / 7 | 15 |
| p27–32 | 36 | 18 / 18 | 11 / 8 | 20 |
| p33–39 | 45 | 29 / 29 | 16 / 13 | 27 |
| p40–53 | 84 | 58 / 48 | 35 / 31 | 51 |
| p54–55 | 10 | 8 / 7 | 3 / 2 | 7 |

Every chapter fails both signs even with arbitrary within-group and within-chapter ordering, arbitrary clock origin, and all short groups granted free. The same authentic p56 85/85 replay passes. Six 669-word held-out literary plants with independent arbitrary post-encryption permutations and group shuffle retain 250/250 true ordered plaintext and absolute clock edges; 88/250 have unique edge in this widened search, and 19/26 OOV anchors have chance alternatives. True edges by construction fit the donor interval. This shows why individual original dictionary matches are not plaintext; absolute window consistency is decisive. No original key or plaintext recovered. Cross-chapter group shuffling, unrelated keys, extra clock movement and decoy group membership are not excluded. Retire this full outer permutation under chapter continuity, not every H-shuffle model.

[Exact CommonJS reproducer](../sims/lp2_postshuffle_prime_outer_multiset_sft.cjs) · [Executed summary](lp2-postshuffle-prime-outer-multiset-summary.json). V8 run took 114.44s. The full edge arrays were computed in memory but only their summaries were emitted in the run; the standalone script prints complete edges. Saved wrapper is derived from the executed core, omitting a redundant superseded initial window sweep; no separate Windows run. No new CI.

### Joint collision-redraw and arbitrary outer permutation

[Completed exact joint extension](lp2-postshuffle-prime-joint-result.md): all 29220 feasible starts, 819931509 trie states, both signs, 20/20 planted anchors. Every chapter fails the shared maximal-clock-window coverage bound despite free within-group permutation and group reordering. Conditional on chapter membership and the same 5% OOV allowance. No unknown plaintext. Reproduce with [input generator](../sims/lp2_postshuffle_prime_joint_prepare.cjs), [C++ inverse](../sims/lp2_postshuffle_prime_joint.cpp), [Python aggregator](../sims/lp2_postshuffle_prime_joint_summarize.py).
