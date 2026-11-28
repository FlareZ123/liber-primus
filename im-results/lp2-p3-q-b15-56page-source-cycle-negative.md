# P3 quotient Q^(b=15): an exact 56-page clock, but not a direct LP2 body cipher

**Agent48, 28 November 2026. Classification:** newly source-motivated finite candidate and original-cipher negative, not plaintext recovery. Exact SFT: [`sims/lp2_p3_q_b15_pageclock_original_sft.cjs`](../sims/lp2_p3_q_b15_pageclock_original_sft.cjs). Its inputs are committed original LP2 GP29 indices, complete-red annotations and an independent native-language control.

## Why this particular page clock deserves a test

An already-established original-red relationship constructs the p3 quotient field
`GF(29)[u]/(u²-3u-8)`, then the p15-second minus solved-p57 quotient
`Q=17+24u`. Earlier work proves `Q` is primitive of order
`29²−1=840`. The **authenticated 2013 DH worked example** has
Bob exponent `b=15`. Independently, there are exactly **56 encrypted/unsolved
physical LP2 pages, p0…p55**, followed by two intentionally simple
solved pages p56 and p57. Therefore the direct historical stride gives:

```text
b = 15
Q^15 = 21 + 15u
order(Q^15) = 840 / gcd(840,15) = 56
Q^(15×56) = 1
Q^420 = -1
```

Among the nine previously reconstructed 2013 DH/register integers
`{2,3,4,5,6,8,15,19,23}`, **15 alone** has `gcd(840,n)=15`, so only
its Q-power has order56. This is an exact algebraic match of two
source-authentic numerals and the unresolved-page count. It does **not**
prove that the creator instructed solvers to step the Q state once
per page; that operation was conceived after the page count and
historical example were known.

This hypothesis is structurally different from the existing
global-Q multiplier negative and the F(Qx) red-state navigation chain:
one whole page advances the key by Q^15, and optional progression
inside each page advances by Q once per local rune or rune **pair**.

## Two independent original-input gates

**Red-span navigation.** Reduce all 18 complete printed red spans
in the p3 field, using the frozen low-to-high coefficient orientation.
For every ordered pair on distinct pages, transport the first state by
`Q^(15×(destinationPage−sourcePage))`; since this operator has
order56, signed gap and gap modulo56 agree. **Zero exact transitions.**
This rejects the direct red-state page-number transport without
choosing a destination after viewing outcomes.

**Original body cipher.** Test page-fixed `Q^(15p)` and a page-reset
running `Q^(15p+j)` stream, in both directions. For each of the four
schedules, all **840** possible global nonzero field-state phases are
charged in two source-motivated decoding laws:

- GP29 ciphertext **pairs** are multiplied by the inverse field state,
  or the state is subtracted componentwise, in page-local adjacent
  two-rune cells. The odd final rune of each original page is excluded
  rather than assigned a made-up padding symbol. **12,924 / 12,956**
  original runes enter the pair gate (32 leftovers excluded).
- GP29 individual runes are shifted by the field's **trace** or **norm**
  of the state. In the source field, coefficient 0, coefficient 1 and
  trace become the **same exhaustive family** when one charges all
  840 starting Q phases, because multiplication by a nonzero field
  element acts transitively on nonzero GF29-linear functionals.
  A sign flip is already present as phase +420. Norm has period28;
  its sign flip is already present as phase +14, leaving just 28
  distinct norm phases. Thus the independent rune-wise charges are
  four schedules × (840 trace +28 norm).

Here `p` is physical page number 0…55 and `j` is the zero-based
rune or rune-pair index inside that page; no chosen source key/seed
is slipped into the original test. The model uses only canonical GP29,
no unknown plaintext cribs, guessed spellings, candidate prose or
phrase-based reranking.

## Outcome and power control

The frozen scoring model is a 29×29 additive-0.25-smoothed GP29
bigram table trained on the **first 20,000** GP runes of the
committed public-domain Gibran `The Prophet` control. Native
held-out runes begin at source index21,000, disjoint from training.
Larger log-likelihood scores (closer to zero) indicate more
native-like consecutive GP runes.

| Input / best family | Full-run GP bigram log-likelihood per transition | GP29 IoC |
|---|---:|---:|
| Original 12,956-rune ciphertext, untransformed | -4.628242 | 0.034478 |
| Held-out native English of identical length | -2.517200 | 0.059757 |
| Best original **pair** page-clock decoding, any 840 phase and all eight models | **-4.575575** | 0.03449 |
| Best original **rune-wise** trace/norm page-clock decoding, all source phases | **-4.57363** | 0.03450 |

Across **all** eight original pair laws and eight independent
trace/norm family combinations, none obtains a score even near
-4.55, let alone the native control. The strongest source phase and
choice of law are deliberately not promoted as key candidates;
the best scores remain consistent with an unbroken near-uniform
original rune stream.

A held-out native passage was encrypted **using the identical
page/rune counts and every tested pair model** with independently
fixed key `Q^23`. Exhaustive 840-phase recovery put the authentic
seed `23` at **rank 1 in all eight**. Matched rune-wise trace and
norm plants also invert exactly and recover seed23 (with the
28-phase norm equivalence charged only once). The positive controls
have the native held-out bigram score, not a trivial short toy
example. Therefore the negative is not due to an unusable scorer
or missing a true key in the finite family.

## Interpretation and stopping rule

The order56 clock is a **new exact mathematical compatibility** worth
remembering; it is not an independently authenticated key. Direct
field-pair multiplication, componentwise field addition, trace
shifts, and norm shifts under the unmodified b15 page clock **fail
on all available original unknown-page rune values**. The
red-span pairwise state-transfer hypothesis fails separately.

Do not tune per-page starts, arbitrary basis changes, skips, H variants,
padding, KDFs or packet contents to rescue this arithmetic alignment.
A new source-visible cipher opcode or seed/side-information selector
must precede further Q^15 decoding work. Existing broader
Q-field candidates and the p27/p47 navigation/state structures
are unaffected by this finite negative.

**Exact reproduction:** `node sims/lp2_p3_q_b15_pageclock_original_sft.cjs`
from repository root (Node22, standard libraries only). The program
asserts Q's order, the 56-cycle, page and rune counts, all positive
controls, all full-body negatives, and the exact zero red-state edges,
then emits compact JSON with every tested original family.
