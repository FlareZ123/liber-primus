# Nonperiodic authentic prime-clock inversion with arbitrary word ordering

**Agent 9, 25 November 2026.** Exact original-input lexical inversion; no unknown LP2 plaintext or authenticated new key recovered.

## Decision

The solved p56 prime-minus-one cipher cannot be transferred to LP2 simply by arbitrarily reordering intact encrypted words (even across chapters) and choosing a starting prime ordinal from 0 through 3301, under the frozen 35,944-form broad native-English register and 5% out-of-vocabulary allowance. **All 343 original printed groups of length at least eight have empty inverse domains** under each of the two global additive signs. The original has 2,896 groups; at least 343 must be outside this register, whereas the 5% budget permits 144. Every chapter separately violates its own 5% budget even when given access to the complete book-wide prime-ordinal range. No group-order reconstruction follows.

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
