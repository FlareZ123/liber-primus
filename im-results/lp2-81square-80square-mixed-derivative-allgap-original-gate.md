# The 81² / 80²−5 source squares reject mixed second differences, even with an unknown 29-symbol output S-box

**Agent 2, 18 November 2026. Evidence: exact original-source combinatorial exclusion of a clue-motivated 4-corner operator. No LP2 plaintext or cipher key recovered.**

## Source-visible geometry and proposed operation

An authentic six-rune GP29 ciphertext word-pair, DJU BEI, occurs at original global offsets 6,555–6,560 and 12,950–12,955. It exactly ends the first **6,561 = 81²** ciphertext runes and the entire **12,956**-rune unknown book. The remainder consists of **6,395 = 80²−5** runes. The previously documented bookend square correspondence is a retrospective mathematical registration, not an authenticated encryption instruction; see [the original repeated-pair structure](lp2-repeated-wordpair-structure.md).

One exceptionally simple reversible-looking mathematical route from the first square to the second is the **mixed finite difference** of every adjacent 2×2 corner:

    D[r,c] = A[r,c] - A[r,c+1] - A[r+1,c] + A[r+1,c+1] (mod 29)

A full 81×81 source produces a full 80×80 field: exactly the two observed candidate side lengths. A human might associate the later solved PARABLE's wording about shedding circumferences with a dimension-reducing operation, although that phrase does not select this equation. To strengthen the cryptanalytic test, permit an *entirely arbitrary secret 29-to-29 output lookup* after the derivative, including non-injective maps. A true substitution permutation, modular affine shift, or alphabet relabelling is a subset of this generous model.

We tested **both** original alphabet registers (GP index modulo29 and the authenticated GP prime weight modulo29), **all eight dihedral orientations** of the 80×80 target, and **every 6,396 possible placement of exactly five omitted consecutive target cells**. This generously removes the uncertainty about where the unprinted five cells fall. No value of the output substitution, orientation or gap is inferred from an English score.

## Exact original results

For any candidate derivative and gap position, count each pair (derivative value, printed output rune). For each of the 29 input values separately, choose its most frequent output rune. This supplies the **largest possible number of matching original runes under any deterministic substitution**, even if its 29 outputs are not distinct. The remaining mismatches are an unconditional lower bound on edits needed by the whole candidate family.

| Scope | Exact result |
| --- | ---: |
| Original source array | 6,561 GP29 runes, shape 81×81 |
| Printed output | 6,395 GP29 runes, five target cells unspecified |
| Geometric/glyph inputs | 2 GP registers × 8 orientations |
| Gap positions per candidate | 6,396 |
| Overall model registrations | 102,336 |
| **Best original matches with arbitrary secret lookup** | **420 / 6,395** |
| **Unavoidable mismatches** | **5,975 / 6,395** |
| Winning representation, orientation, gap | GP-prime residue, identity orientation, gap after 1,968 observed runes |
| Other original candidates | All require at least 5,977 mismatches, except their minima are greater than or equal to 5,975 by construction |

The best original output requires changes to **93.43%** of the 6,395 printed runes under this one-layer construction. A near-match cannot be rescued by an unknown affine constant, different input/output rune names, any secret permutation, the five missing cells, or the previously conjectured allowance of 86 anti-repeat repairs.

**Source-shaped positive:** construct the actual 80×80 mixed difference from the original 81×81 source under GP-prime coordinates, rotate it by 180 degrees, apply the secret bijection y=(7x+11) mod29, and omit five consecutive cells after position 1,234. The identical exact all-gap optimizer recovers **6,395/6,395 matches, zero edits and gap 1,234** without access to the synthetic key. This verifies both all-gap alignment and arbitrary-S-box evaluation.

The [complete original-data, read-only CommonJS reproducer](../sims/lp2_81to80_allgap_mixedderivative_original_sft.cjs) reconstructs the original 12,956-rune stream, checks the repeated six-rune source boundary, computes all 102,336 registrations, asserts the best original lower bound, and executes the planted positive. It passed an execution of the exact stored source in a connector V8 harness with strict assertion equivalents and GitHub's current canonical corpus.

## Decision and limitations

**Reject the specific 81×81→80×80 mixed finite-difference geometry with a stationary output substitution and five missing consecutive target cells** as a generator of the second LP2 block. This is an actual key-independent result in the four-corner family for which an unrestricted 29⁴ lookup is otherwise too flexible to identify a secret rule. The derivation does **not** rule out other four-corner functions, nonlinear feedback, a hidden transposition, multiple encryption layers, arbitrary non-consecutive erasures, or an authored source-square association different from the conjectured 81² block. The current sources contain no first-party instruction selecting the mixed derivative or the geometric square split. No plaintext, key or destination is implied; progress requires an independently selected additional operand or a reversible rule that survives the intact ciphertext.
