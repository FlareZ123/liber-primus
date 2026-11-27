# #3240 — GP29 randomized homophone alphabet/entropy budget

**Agent16 · 27 November 2026. Classification: exact channel-capacity gate plus native-language calibration. No unknown LP2 plaintext/key recovered.**

## Historical channel

Use the standard lossless homophonic-substitution definition already available long before LP2: each plaintext symbol p owns a nonempty set H(p) of ciphertext representatives; the sets are pairwise disjoint; an encryptor chooses one representative, historically often at random; a ciphertext representative therefore decodes to exactly one plaintext symbol.

This is the same formal construction in the pre-2014 *Handbook of Applied Cryptography* (Definition 1.28), and homophones are historically much older: Kahn describes a Mantua 1401 cipher assigning several equivalents to frequent plaintext vowels.

The important cost is not key search but **alphabet budget**.

## Exact GP29 budget

A one-rune-per-rune decoder with k plaintext classes and 29 transmitted GP ciphertext runes must satisfy

sum_p |H(p)| <= 29, with |H(p)| >= 1.

If the plaintext alphabet is full GP29, all 29 outputs are already consumed by the mandatory one representative per plaintext symbol. There is **zero homophonic freedom**: the channel collapses to ordinary one-to-one substitution and cannot suppress adjacent repetition.

The strongest source-compatible restriction is GP27. Across the pinned nine solved native-GP sections, exactly 27 rune types occur; EO (index12) and OE (index22) are absent. GP27 therefore leaves only

29 - 27 = **2 excess ciphertext representatives**

for homophony.

That means either two plaintext symbols get two representatives each, or one plaintext symbol gets three. No key choice can randomize more classes without expansion or ambiguity.

## Collision law

For a plaintext doublet pp under independent random homophone selection, ciphertext equality can occur only inside H(p). If the h_p representatives are selected independently with probabilities q_j,

Pr(C_i=C_(i+1) | pp) = sum_j q_j^2 >= 1/h_p,

with equality for the uniform chooser. Thus the *best possible independent randomized* expected ciphertext-doublet count on a fixed plaintext is

sum_p D_p/h_p,

where D_p is the number of pp plaintext doublets.

I also grant a deliberately stronger rival: whenever h_p>=2, suppose a stateful chooser magically avoids a repeat with probability 1. This is more powerful than independent randomized homophony and gives a hard optimistic lower bound. With only two excess outputs, it can protect at most two plaintext-symbol classes.

## Authentic solved-GP control

Concatenate the pinned nine solved native-GP records:

- 2,979 runes;
- exactly 27 active rune types;
- 77 adjacent equalities, rate 2.5856%.

The optimal GP27→GP29 independent-uniform allocation gives the two extra representatives to L and S:

- expected doublets: **60.0**;
- expected rate: **2.0148%**;
- random-selection entropy: only **0.1034 bits/plain-rune**.

Even the impossible-to-beat stateful gift that eliminates *all* L and S collisions leaves:

- 43 doublets;
- **1.4439%**, more than twice LP2's 0.6666%.

To drive this authentic register below the LP2 rate, the ideal stateful model needs at least **33 output symbols**; the independent-uniform randomized channel needs **57**.

## Independent GP27 prose controls

For external English controls I use the repository's native-GP transliterator but deliberately do **not** emit EO/OE compounds, matching the solved-source GP27 register. Every control still uses all 27 remaining rune types.

| control | runes | native repeat rate | best GP29 iid rate | best GP29 ideal-stateful rate | min alphabet iid | min alphabet ideal |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | 56,245 | 2.9905% | **2.3656%** | **1.7406%** | 73 | 34 |
| Emerson | 288,228 | 2.9609% | **2.3886%** | **1.8163%** | 71 | 34 |
| Shakespeare | 191,581 | 3.3036% | **2.6347%** | **1.9658%** | 79 | 35 |

For these controls the optimal two GP29 homophones protect L and E. The resulting independent random-choice entropy is only **0.150–0.159 bits/plain-rune**.

Target LP2 same-page rate is 86 / 12,901 = **0.666615%**.

So the failure is not a donor-specific histogram accident: three independent large native registers and the authentic solved source all miss by wide margins even under a stateful bound stronger than the requested randomized channel.

## Expansion and exceptions

A fixed-length homophone string of t>1 GP runes increases ciphertext length by factor t. A variable-length representative needs prefix/framing information. Either case is no longer the observed one-rune GP29 channel and requires an independently supplied transport or segmentation rule.

Likewise, collapsing two plaintext runes to share one ciphertext representative is polyphony, not homophony, and destroys unique decoding unless side information is added. #3225 already quantifies how quickly such side information explodes for a GP29→28 fold.

No original LP2 feature presently fixes such an expansion/framing layer, so there is no licensed key search after the capacity failure.

## Decision

**Reject one-rune disjoint randomized homophonic substitution as the explanation for LP2's rare adjacent repeats.**

- GP29 plaintext: zero excess homophones.
- Source-compatible GP27 plaintext: only two excess homophones.
- Two excess homophones cannot reduce authentic/native repeat structure anywhere near 0.6666%, even with an unrealistically perfect stateful anti-repeat chooser.
- Matching the observed rate requires roughly 33–35 output symbols even under that ideal stateful bound, or 57–79 for genuine independent uniform random homophony.

A successor must provide a source-selected expansion/framing mechanism, a larger transmitted alphabet, or a materially different stateful cipher. Arbitrary randomized masks inside GP29 are capacity-inadequate.

## Reproduction

sims/lp2_gp29_homophone_entropy_budget_sft.cjs

Pinned inputs:
- resources/liber-primus/lp2-corpus.json
- resources/external/relikd-solved-gp29-native-v1.json
- resources/control/gibran_prophet_58585.txt
- resources/control/emerson_essays_2944.txt
- resources/control/shakespeare_first300k.txt
